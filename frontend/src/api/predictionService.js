import { createEntityService } from './entityServiceFactory.js';
import { apiRequest } from './httpClient.js';

const predictionService = createEntityService('/predictions');

export const fetchPredictionEntities = (filters = {}) => predictionService.list('-created_date', 50, filters);
export const updatePredictionEntity = (entityId, updateData) => predictionService.update(entityId, updateData);
export const createPredictionEntity = (entityData) => predictionService.create(entityData);
export const deletePredictionEntity = (entityId) => predictionService.delete(entityId);

// Disease prediction
export const predictDisease = async (data) => {
    try {
        const response = await apiRequest('/predict-disease', {
            method: 'POST',
            body: data
        });
        return response;
    } catch (error) {
        console.error('Disease prediction error:', error);
        throw error;
    }
};
