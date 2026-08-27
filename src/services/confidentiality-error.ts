export const CONFIDENTIALITY_AGREEMENT_REQUIRED =
  'CONFIDENTIALITY_AGREEMENT_REQUIRED';

export function isConfidentialityRequiredError(error: unknown): boolean {
  const err = error as {
    response?: { status?: number; data?: { code?: string } };
  };
  return (
    err?.response?.status === 403 &&
    err.response.data?.code === CONFIDENTIALITY_AGREEMENT_REQUIRED
  );
}
