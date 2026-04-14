import { createEntityService } from './entityServiceFactory.js';

const hospitalService = createEntityService('/hospitals');

export const fetchHospitalEntities = (filters = {}) => hospitalService.list('-created_date', 50, filters);
export const updateHospitalEntity = (entityId, updateData) => hospitalService.update(entityId, updateData);
export const createHospitalEntity = (entityData) => hospitalService.create(entityData);
export const deleteHospitalEntity = (entityId) => hospitalService.delete(entityId);
