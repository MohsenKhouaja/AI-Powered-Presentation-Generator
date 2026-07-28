import {
  badGateway,
  serviceUnavailable,
} from "../../errors/http-error.js";

type GeneratedSlide = {
  markdown: string;
};

type ContextFileForPrompt = {
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  base64File?: string;
};

type AiGenerationInput = {
  title: string;
  contextPrompt: string;
  files: ContextFileForPrompt[];
  numSlides?: number;
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

const generateSlidesWithOpenRouter = async (
  input: AiGenerationInput,
): Promise<GeneratedSlide[]> => {
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

export const aiService = {
  generateSlidesWithOpenRouter,
} as const;
