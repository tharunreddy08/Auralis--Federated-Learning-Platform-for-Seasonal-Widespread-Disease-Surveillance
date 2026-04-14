import { createEntityService } from './entityServiceFactory.js';

const patientDataService = createEntityService('/patient-data');

export const fetchPatientDataEntities = (filters = {}) => patientDataService.list('-created_date', 50, filters);
export const updatePatientDataEntity = (entityId, updateData) => patientDataService.update(entityId, updateData);
export const createPatientDataEntity = (entityData) => patientDataService.create(entityData);
export const deletePatientDataEntity = (entityId) => patientDataService.delete(entityId);
