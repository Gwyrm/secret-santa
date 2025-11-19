// src/utils/dataEncoding.ts

import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

export const encodeHashPayload = (data: unknown): string => {
  const json = JSON.stringify(data);
  return compressToEncodedURIComponent(json);
};

export const decodeHashPayload = <T>(payload: string): T | null => {
  try {
    const json = decompressFromEncodedURIComponent(payload);
    if (!json) {
      return null;
    }
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Erreur de décompression des données URL:', error);
    return null;
  }
};

