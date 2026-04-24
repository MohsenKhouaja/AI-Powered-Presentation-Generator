import {
  apiValidationErrorSchema,
  authCredentialsSchema,
} from "@p2m/contracts/validators";

export const parseAuthCredentialsInput = (input: unknown) => {
  return authCredentialsSchema.safeParse(input);
};

export const parseValidationErrorMessage = (input: unknown): string | null => {
  const parsed = apiValidationErrorSchema.safeParse(input);

  if (!parsed.success) {
    return null;
  }

  const firstIssue = parsed.data.error.issues[0];
  return firstIssue?.message ?? parsed.data.error.message;
};
