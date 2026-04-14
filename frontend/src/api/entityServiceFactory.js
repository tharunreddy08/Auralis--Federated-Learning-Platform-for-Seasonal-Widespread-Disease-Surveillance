import { apiRequest, normalizeDocument, normalizeDocuments } from './httpClient.js';

const sortAliases = {
  '-created_date': '-createdAt',
  'created_date': 'createdAt',
  '-updated_date': '-updatedAt',
  'updated_date': 'updatedAt'
};

const normalizeSort = (sort) => sortAliases[sort] || sort;

export const createEntityService = (endpoint) => ({
  list: async (sort = '-createdAt', limit = 20, filters = {}) => {
    const response = await apiRequest(endpoint, {
      query: {
        sort: normalizeSort(sort),
        limit,
        ...filters
      }
    });

    const items = Array.isArray(response) ? response : response?.items || [];
    return normalizeDocuments(items);
  },
  create: async (payload) => normalizeDocument(await apiRequest(endpoint, { method: 'POST', body: payload })),
  update: async (id, payload) => normalizeDocument(await apiRequest(`${endpoint}/${id}`, { method: 'PUT', body: payload })),
  delete: async (id) => apiRequest(`${endpoint}/${id}`, { method: 'DELETE' }),
  bulkCreate: async (items) => Promise.all(items.map((item) => apiRequest(endpoint, { method: 'POST', body: item })))
});