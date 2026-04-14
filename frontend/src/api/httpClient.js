import { getApiConfig } from './apiConfig.js';

const normalizeDocument = (document) => {
  if (!document || typeof document !== 'object') {
    return document;
  }

  return {
    ...document,
    id: document.id || document._id,
    created_date: document.created_date || document.createdAt,
    updated_date: document.updated_date || document.updatedAt
  };
};

const normalizeDocuments = (documents) => documents.map(normalizeDocument);

const buildUrl = (path, query = {}) => {
  const { baseUrl } = getApiConfig();
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  const url = new URL(normalizedPath, `${baseUrl}/`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const parseErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload?.message || payload?.error || response.statusText;
  } catch {
    return response.statusText;
  }
};

export const apiRequest = async (path, options = {}) => {
  const { body, headers, method = 'GET', query } = options;
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export { buildUrl, normalizeDocument, normalizeDocuments };