import httpClient from './http';
import type {
  ConfidentialityAcceptance,
  ConfidentialityStatus,
} from '../types/backend';

export type { ConfidentialityAcceptance, ConfidentialityStatus };

export async function getConfidentialityStatus(): Promise<ConfidentialityStatus> {
  const response = await httpClient.get<ConfidentialityStatus>(
    '/confidentiality/status',
  );
  return response.data;
}

export async function acceptConfidentiality(
  version?: string,
): Promise<ConfidentialityAcceptance> {
  const response = await httpClient.post<ConfidentialityAcceptance>(
    '/confidentiality/accept',
    version ? { version } : {},
  );
  return response.data;
}
