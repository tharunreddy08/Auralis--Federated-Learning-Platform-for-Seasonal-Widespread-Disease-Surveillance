import { createEntityService } from './entityServiceFactory.js';

const diseaseAlertService = createEntityService('/disease-alerts');

export const fetchDiseaseAlertEntities = (filters = {}) => diseaseAlertService.list('-created_date', 500, filters);
export const updateDiseaseAlertEntity = (entityId, updateData) => diseaseAlertService.update(entityId, updateData);
export const createDiseaseAlertEntity = (entityData) => diseaseAlertService.create(entityData);
export const deleteDiseaseAlertEntity = (entityId) => diseaseAlertService.delete(entityId);
