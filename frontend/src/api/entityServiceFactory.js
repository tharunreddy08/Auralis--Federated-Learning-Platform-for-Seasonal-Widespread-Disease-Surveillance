import { apiRequest, normalizeDocument, normalizeDocuments } from './httpClient.js';

/** @type {Record<string, string>} */
const sortAliases = {
  '-created_date': '-createdAt',
  'created_date': 'createdAt',
  '-updated_date': '-updatedAt',
  'updated_date': 'updatedAt'
};

/** @param {string} sort */
const normalizeSort = (sort) => sortAliases[sort] || sort;

/**
 * @param {string} endpoint
 */
export const createEntityService = (endpoint) => ({
  /**
   * @param {string} [sort='-createdAt']
   * @param {number} [limit=20]
   * @param {Record<string, unknown>} [filters={}]
   */
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
  /**
   * @param {string} [sort='-createdAt']
   * @param {number} [limit=20]
   * @param {Record<string, unknown>} [filters={}]
   */
  listWithMeta: async (sort = '-createdAt', limit = 20, filters = {}) => {
    const response = await apiRequest(endpoint, {
      query: {
        sort: normalizeSort(sort),
        limit,
        ...filters
      }
    });

    const items = Array.isArray(response) ? response : response?.items || [];
    const pagination = Array.isArray(response) ? null : response?.pagination || null;

    return {
      items: normalizeDocuments(items),
      pagination
    };
  },
  /** @param {Record<string, unknown>} payload */
  create: async (payload) => normalizeDocument(await apiRequest(endpoint, { method: 'POST', body: payload })),
  /** @param {string} id @param {Record<string, unknown>} payload */
  update: async (id, payload) => normalizeDocument(await apiRequest(`${endpoint}/${id}`, { method: 'PUT', body: payload })),
  /** @param {string} id */
  delete: async (id) => apiRequest(`${endpoint}/${id}`, { method: 'DELETE' }),
  /** @param {Array<Record<string, unknown>>} items */
  bulkCreate: async (items) => Promise.all(items.map((item) => apiRequest(endpoint, { method: 'POST', body: item })))
});