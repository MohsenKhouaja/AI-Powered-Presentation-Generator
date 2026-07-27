import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { requirePresentationAccess } from "../../authorization/presentation-authorization.js";
import type { DBContext } from "../../database/index.js";
import { slides } from "../../database/drizzle/schema.js";
import type { SlideRow } from "../../database/types.js";
import {
  badGateway,
  badRequest,
  notFound,
  serviceUnavailable,
} from "../../errors/http-error.js";
import { contextService } from "../contexts/contexts-service.js";

export type slideOrder = {
  id: UUID;
  order: number;
}[];

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

const OPENROUTER_CHAT_COMPLETIONS_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const extractJsonObject = (text: string): string => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw badGateway(
      "Slide generation returned an invalid response",
      "SLIDE_GENERATION_FAILED",
    );
  }
  return text.slice(start, end + 1);
};

const generateSlidesWithOpenRouter = async (input: {
  title: string;
  contextPrompt: string;
  files: ContextFileForPrompt[];
  numSlides?: number;
}): Promise<GeneratedSlide[]> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw serviceUnavailable(
      "Slide generation is unavailable",
      "SLIDE_GENERATION_UNAVAILABLE",
    );
  }

  const model = process.env.OPENROUTER_MODEL || "tencent/hy3:free";

  const system = "You generate slide decks. Output must be valid JSON only.";

  const maxBase64Chars = Number(
    process.env.OPENROUTER_MAX_FILE_BASE64_CHARS || 50_000,
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

  let response: Response;
  try {
    response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
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
  } catch {
    throw badGateway(
      "Slide generation provider is unreachable",
      "SLIDE_GENERATION_FAILED",
    );
  }

  if (!response.ok) {
    throw badGateway(
      `Slide generation provider failed with status ${response.status}`,
      "SLIDE_GENERATION_FAILED",
    );
  }

  let data: {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  try {
    data = (await response.json()) as typeof data;
  } catch {
    throw badGateway(
      "Slide generation returned an invalid response",
      "SLIDE_GENERATION_FAILED",
    );
  }

  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) {
    throw badGateway(
      "Slide generation returned an empty response",
      "SLIDE_GENERATION_FAILED",
    );
  }

  const jsonText = extractJsonObject(content);
  let parsed: { slides?: GeneratedSlide[] };
  try {
    parsed = JSON.parse(jsonText) as { slides?: GeneratedSlide[] };
  } catch {
    throw badGateway(
      "Slide generation returned invalid JSON",
      "SLIDE_GENERATION_FAILED",
    );
  }

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
    throw badGateway(
      "Slide generation returned no usable slides",
      "SLIDE_GENERATION_FAILED",
    );
  }

  return normalized;
};

const findMany = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
): Promise<SlideRow[]> => {
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "view",
  });

  return await db.query.slides.findMany({
    where: { presentationId },
    orderBy: { slideOrder: "asc" },
  });
};

const findOne = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  slideId: UUID,
): Promise<SlideRow> => {
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "view",
  });

  const slideRow = await db.query.slides.findFirst({
    where: { id: slideId, presentationId },
  });

  if (!slideRow) {
    throw notFound("Slide not found", "SLIDE_NOT_FOUND");
  }

  return slideRow;
};

const create = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  input: SlideCreateInput,
): Promise<SlideRow> => {
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "editContent",
  });

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
    content: input.content,
    slideOrder: nextOrder,
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
): Promise<SlideRow> => {
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "editContent",
  });

  const slideRow = await db.query.slides.findFirst({
    where: { id: slideId, presentationId },
  });

  if (!slideRow) {
    throw notFound("Slide not found", "SLIDE_NOT_FOUND");
  }

  await db
    .update(slides)
    .set({ content })
    .where(
      and(eq(slides.id, slideId), eq(slides.presentationId, presentationId)),
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
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "editContent",
  });

  const slideRow = await db.query.slides.findFirst({
    where: { id: slideId, presentationId },
  });

  if (!slideRow) {
    throw notFound("Slide not found", "SLIDE_NOT_FOUND");
  }

  await db.transaction(async (tx) => {
    await tx.delete(slides).where(eq(slides.id, slideId));
    await tx
      .update(slides)
      .set({ slideOrder: sql`${slides.slideOrder} - 1` })
      .where(
        and(
          eq(slides.presentationId, presentationId),
          gt(slides.slideOrder, slideRow.slideOrder ?? 0),
        ),
      );
  });
  return { id: slideId, deleted: true };
};

const updateOrder = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  firstSlideOrder: slideOrder,
  secondSlideOrder: slideOrder,
): Promise<slideOrder[]> => {
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "editContent",
  });
  if (
    !Array.isArray(firstSlideOrder) ||
    !Array.isArray(secondSlideOrder) ||
    firstSlideOrder.length === 0 ||
    firstSlideOrder.length !== secondSlideOrder.length
  ) {
    throw badRequest(
      "Slide order lists must have the same non-zero length",
      "INVALID_SLIDE_ORDER",
    );
  }
  const firstIds = firstSlideOrder.map((entry) => entry?.id);
  const secondIds = secondSlideOrder.map((entry) => entry?.id);
  const requestedOrders = secondSlideOrder.map((entry) => entry?.order);
  if (
    firstIds.some((id) => typeof id !== "string") ||
    secondIds.some((id) => typeof id !== "string") ||
    requestedOrders.some(
      (order) => !Number.isInteger(order) || Number(order) < 1,
    ) ||
    new Set(firstIds).size !== firstIds.length ||
    new Set(secondIds).size !== secondIds.length ||
    new Set(requestedOrders).size !== requestedOrders.length ||
    firstIds.some((id) => !secondIds.includes(id))
  ) {
    throw badRequest(
      "Slide order entries must contain the same unique IDs and orders",
      "INVALID_SLIDE_ORDER",
    );
  }

  const presentationSlides = await db.query.slides.findMany({
    where: { presentationId, id: { in: firstIds } },
    columns: { id: true },
  });
  if (presentationSlides.length !== firstIds.length) {
    throw notFound("Slide not found", "SLIDE_NOT_FOUND");
  }

  await db.transaction(async (tx) => {
    for (let index = 0; index < firstIds.length; index++) {
      await tx
        .update(slides)
        .set({ slideOrder: -(index + 1) })
        .where(
          and(
            eq(slides.id, firstIds[index]),
            eq(slides.presentationId, presentationId),
          ),
        );
    }
    for (const entry of secondSlideOrder) {
      await tx
        .update(slides)
        .set({ slideOrder: entry.order })
        .where(
          and(
            eq(slides.id, entry.id),
            eq(slides.presentationId, presentationId),
          ),
        );
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
): Promise<SlideRow[]> => {
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "editContent",
  });

  const presentationRow = await db.query.presentations.findFirst({
    where: { id: presentationId },
    columns: { id: true, title: true },
  });

  if (!presentationRow) {
    throw notFound();
  }

  const contextRow = await contextService.findOne(db, userId, contextId);
  if (!contextRow) {
    throw notFound("Context not found", "CONTEXT_NOT_FOUND");
  }

  if (contextRow.presentationId !== presentationId) {
    throw notFound("Context not found", "CONTEXT_NOT_FOUND");
  }

  const contextPrompt = contextRow.prompt ?? "";
  const contextFiles = Array.isArray(contextRow.files) ? contextRow.files : [];

  if (!contextPrompt.trim() && contextFiles.length === 0) {
    throw badRequest(
      "Presentation context is empty",
      "PRESENTATION_CONTEXT_EMPTY",
    );
  }

  const generated = await generateSlidesWithOpenRouter({
    title: presentationRow.title,
    contextPrompt,
    files: contextFiles,
    numSlides,
  });

  const createdSlides: SlideRow[] = [];

  await db.transaction(async (tx) => {
    await tx.delete(slides).where(eq(slides.presentationId, presentationId));

    for (let i = 0; i < generated.length; i++) {
      const slideId = randomUUID() as UUID;
      const markdown = generated[i].markdown;
      const slideOrder = i + 1;

      await tx.insert(slides).values({
        id: slideId,
        presentationId,
        content: markdown,
        slideOrder,
      });

      createdSlides.push({
        id: slideId,
        presentationId,
        content: markdown,
        slideOrder,
      });
    }
  });

  return createdSlides;
};

const removeAllByPresentation = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
) => {
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "editContent",
  });
  await db.delete(slides).where(eq(slides.presentationId, presentationId));
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
