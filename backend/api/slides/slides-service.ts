import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { and, eq, gt, inArray } from "drizzle-orm";
import type { Collection } from "mongodb";
import type { DBContext } from "../../database/index.js";
import { mongoDB } from "../../database/index.js";
import {
  editAccess,
  presentations,
  slides,
} from "../../database/drizzle/schema.js";
import type { SlideRow, SlideRowWithContent } from "../../database/types.js";
import { contextService } from "../contexts/contexts-service.js";

export type slideOrder = {
  id: UUID;
  order: number;
}[];

type SlideContentDocument = {
  _id: string;
  slide_content: string;
};

type SlideCreateInput = {
  content: string;
  slideOrder?: number;
};

type GeneratedSlide = {
  markdown: string;
};

type ContextFileForPrompt = {
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  base64File?: string;
};

const slidesContentCollection: Collection<SlideContentDocument> =
  mongoDB.collection<SlideContentDocument>("slides_content");

const GROQ_CHAT_COMPLETIONS_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const extractJsonObject = (text: string): string => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("LLM response did not contain JSON object");
  }
  return text.slice(start, end + 1);
};

const generateSlidesWithGroq = async (input: {
  title: string;
  contextPrompt: string;
  files: ContextFileForPrompt[];
  numSlides?: number;
}): Promise<GeneratedSlide[]> => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROQ;
  if (!apiKey) {
    throw new Error("Groq API key is not set (expected GROQ or GROQ_API_KEY)");
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

  const system = "You generate slide decks. Output must be valid JSON only.";

  const maxBase64Chars = Number(
    process.env.GROQ_MAX_FILE_BASE64_CHARS || 50_000,
  );

  const filesForPrompt = (input.files ?? []).map((file, index) => {
    const base64 = typeof file.base64File === "string" ? file.base64File : "";
    const truncated =
      maxBase64Chars > 0 && base64.length > maxBase64Chars
        ? base64.slice(0, maxBase64Chars)
        : base64;

    return {
      index: index + 1,
      originalName: file.originalName ?? "",
      mimeType: file.mimeType ?? "",
      sizeBytes: typeof file.sizeBytes === "number" ? file.sizeBytes : null,
      base64File: truncated,
      base64Truncated: truncated.length !== base64.length,
    };
  });

  const slideCountRule =
    typeof input.numSlides === "number"
      ? `- Generate exactly ${input.numSlides} slides.`
      : "- Prefer 6 to 12 slides depending on content.";

  const user = `Create a slide deck in Markdown for the following presentation.

Title: ${input.title}

Context:
${input.contextPrompt}

Files (base64, may be truncated):
${JSON.stringify(filesForPrompt, null, 2)}

Return ONLY a JSON object of the form:
{
  "slides": [
    { "markdown": "# Slide title\\n- bullet" }
  ]
}

Rules:
- Each slide must be self-contained Markdown.
${slideCountRule}
- Slide 1 is a title slide.
- Use concise bullets; no giant paragraphs.
`;

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      `Groq request failed (${response.status}): ${bodyText || response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) {
    throw new Error("Groq response was empty");
  }

  const jsonText = extractJsonObject(content);
  const parsed = JSON.parse(jsonText) as { slides?: GeneratedSlide[] };

  const slidesArray = Array.isArray(parsed.slides) ? parsed.slides : [];
  let normalized = slidesArray
    .map((s) => ({
      markdown: typeof s?.markdown === "string" ? s.markdown : "",
    }))
    .filter((s) => s.markdown.trim().length > 0);

  if (typeof input.numSlides === "number" && input.numSlides > 0) {
    normalized = normalized.slice(0, input.numSlides);
  }

  if (normalized.length === 0) {
    throw new Error("Groq did not return any slides");
  }

  return normalized;
};

const hasActiveEditAccess = async (
  db: DBContext,
  presentationId: UUID,
  userId: UUID,
): Promise<boolean> => {
  const activeEditAccess = await db.query.editAccess.findFirst({
    where: {
      presentationId,
      userId,
      OR: [{ expiresAt: { isNull: true } }, { expiresAt: { gt: new Date() } }],
    },
    columns: { id: true },
  });

  return Boolean(activeEditAccess);
};

const assertCanEditPresentation = async (
  db: DBContext,
  presentationId: UUID,
  userId: UUID,
): Promise<void> => {
  const presentationRow = await db.query.presentations.findFirst({
    where: { id: presentationId },
    columns: { id: true, userId: true },
  });

  if (!presentationRow) {
    throw new Error("presentation doesn't exist");
  }

  if (presentationRow.userId === userId) {
    return;
  }

  const canEdit = await hasActiveEditAccess(db, presentationId, userId);
  if (!canEdit) {
    throw new Error("user unauthorized to edit this presentation");
  }
};

const getMongoContentBySlideId = async (
  slideId: UUID,
): Promise<string | null> => {
  const contentDoc = await slidesContentCollection.findOne({ _id: slideId });
  return contentDoc?.slide_content ?? null;
};

const findMany = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
): Promise<SlideRowWithContent[]> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRows: SlideRow[] = await db.query.slides.findMany({
    where: { presentationId },
    orderBy: { slideOrder: "asc" },
  });

  return await Promise.all(
    slideRows.map(async (slideRow) => {
      const mongoContent = await getMongoContentBySlideId(slideRow.id as UUID);
      return {
        id: slideRow.id,
        presentationId: slideRow.presentationId,
        content: mongoContent,
        slideOrder: slideRow.slideOrder,
      };
    }),
  );
};

const findOne = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  slideId: UUID,
): Promise<SlideRowWithContent> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRow: SlideRow | null = await db.query.slides.findFirst({
    where: { id: slideId, presentationId },
  });

  if (!slideRow) {
    throw new Error("slide doesn't exist");
  }

  const mongoContent = await getMongoContentBySlideId(slideId);
  return {
    id: slideRow.id,
    presentationId: slideRow.presentationId,
    content: mongoContent,
    slideOrder: slideRow.slideOrder,
  };
};

const create = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  input: SlideCreateInput,
): Promise<SlideRowWithContent> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideId = randomUUID();

  const maxOrderRow = await db.query.slides.findFirst({
    where: { presentationId },
    columns: { slideOrder: true },
    orderBy: { slideOrder: "desc" },
  });

  const maxOrder = maxOrderRow?.slideOrder ?? 0;

  const nextOrder =
    typeof input.slideOrder === "number" && input.slideOrder > 0
      ? input.slideOrder
      : maxOrder + 1;

  await db.insert(slides).values({
    id: slideId,
    presentationId,
    slideOrder: nextOrder,
  });

  await slidesContentCollection.insertOne({
    _id: slideId,
    slide_content: input.content,
  });

  return {
    id: slideId,
    presentationId,
    content: input.content,
    slideOrder: nextOrder,
  };
};

const update = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  slideId: UUID,
  content: string,
): Promise<SlideRowWithContent> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRow: SlideRow | null = await db.query.slides.findFirst({
    where: { id: slideId, presentationId },
  });

  if (!slideRow) {
    throw new Error("slide doesn't exist");
  }

  await slidesContentCollection.updateOne(
    { _id: slideId },
    { $set: { slide_content: content } },
    { upsert: true },
  );

  return {
    id: slideRow.id,
    presentationId: slideRow.presentationId,
    content: content,
    slideOrder: slideRow.slideOrder,
  };
};

const removeOne = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  slideId: UUID,
): Promise<{ id: UUID; deleted: true }> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRow = await db.query.slides.findFirst({
    where: { id: slideId, presentationId },
  });

  if (!slideRow) {
    throw new Error("slide doesn't exist");
  }

  await db.transaction(async (tx) => {
    await tx.delete(slides).where(eq(slides.id, slideId));
    await tx
      .update(slides)
      .set({ slideOrder: (slideRow.slideOrder ?? 0) - 1 })
      .where(
        and(
          eq(slides.presentationId, presentationId),
          gt(slides.slideOrder, slideRow.slideOrder ?? 0),
        ),
      );
  });
  await slidesContentCollection.deleteOne({ _id: slideId });

  return { id: slideId, deleted: true };
};

const updateOrder = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  firstSlideOrder: slideOrder,
  secondSlideOrder: slideOrder,
): Promise<slideOrder[]> => {
  await assertCanEditPresentation(db, presentationId, userId);
  if (firstSlideOrder.length !== secondSlideOrder.length) {
    throw new Error("slide orders length mismatch");
  }
  await db.transaction(async (tx) => {
    for (let i = 0; i < firstSlideOrder.length; i++) {
      const firstSlide = firstSlideOrder[i];
      const secondSlide = secondSlideOrder[i];
      if (firstSlide.id !== secondSlide.id) {
        await tx.slides
          .update()
          .set({ slideOrder: secondSlide.order })
          .where(eq(slides.id, firstSlide.id));
      }
    }
  });
  return [secondSlideOrder];
};

const generateFromContext = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  contextId: UUID,
  numSlides?: number,
): Promise<SlideRowWithContent[]> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const presentationRow = await db.query.presentations.findFirst({
    where: { id: presentationId },
    columns: { id: true, title: true },
  });

  if (!presentationRow) {
    throw new Error("presentation doesn't exist");
  }

  const contextRow = await contextService.findOne(db, contextId);
  if (!contextRow) {
    throw new Error("context doesn't exist");
  }

  if (contextRow.presentationId !== presentationId) {
    throw new Error("context does not belong to this presentation");
  }

  const contextPrompt = contextRow.prompt ?? "";
  const contextFiles = Array.isArray(contextRow.files) ? contextRow.files : [];

  if (!contextPrompt.trim() && contextFiles.length === 0) {
    throw new Error("presentation context is empty");
  }

  const generated = await generateSlidesWithGroq({
    title: presentationRow.title,
    contextPrompt,
    files: contextFiles,
    numSlides,
  });

  await removeAllByPresentation(db, userId, presentationId);

  const createdSlides: SlideRowWithContent[] = [];
  const mongoDocs: SlideContentDocument[] = [];

  await db.transaction(async (tx) => {
    for (let i = 0; i < generated.length; i++) {
      const slideId = randomUUID() as UUID;
      const markdown = generated[i].markdown;
      const slideOrder = i + 1;

      await tx.insert(slides).values({
        id: slideId,
        presentationId,
        slideOrder,
      });

      createdSlides.push({
        id: slideId,
        presentationId,
        content: markdown,
        slideOrder,
      });

      mongoDocs.push({ _id: slideId, slide_content: markdown });
    }
  });

  if (mongoDocs.length > 0) {
    await slidesContentCollection.insertMany(mongoDocs);
  }

  return createdSlides;
};

const removeAllByPresentation = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
) => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRows = await db.query.slides.findMany({
    where: { presentationId },
    columns: { id: true },
  });

  if (!slideRows) {
    throw new Error("slide doesn't exist");
  }

  if (slideRows.length > 0) {
    await slidesContentCollection.deleteMany({
      _id: { $in: slideRows.map((slide) => slide.id) },
    });
    await db.delete(slides).where(eq(slides.presentationId, presentationId));
  }
};

export const slidesService = {
  findMany,
  findOne,
  create,
  update,
  removeOne,
  removeAllByPresentation,
  generateFromContext,
  updateOrder,
} as const;
