import { createEntityService } from './entityServiceFactory.js';

const modelUpdateService = createEntityService('/model-updates');

export const fetchModelUpdateEntities = (filters = {}) => modelUpdateService.list('-created_date', 20, filters);
export const updateModelUpdateEntity = (entityId, updateData) => modelUpdateService.update(entityId, updateData);
export const createModelUpdateEntity = (entityData) => modelUpdateService.create(entityData);
export const deleteModelUpdateEntity = (entityId) => modelUpdateService.delete(entityId);
