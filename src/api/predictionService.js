// Prediction API Service
import { getApiConfig } from './apiConfig.js';

const getConfig = () => getApiConfig();

// Filterable fields: disease, region, predicted_cases, confidence, prediction_date, model_version, trend
export async function fetchPredictionEntities(filters = {}) {
    const { baseUrl, appId, apiKey } = getConfig();
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${baseUrl}/${appId}/entities/Prediction${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch predictions: ${response.statusText}`);
    }

    return response.json();
}

export async function updatePredictionEntity(entityId, updateData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/Prediction/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        throw new Error(`Failed to update prediction: ${response.statusText}`);
    }

    return response.json();
}

export async function createPredictionEntity(entityData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/Prediction`, {
        method: 'POST',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entityData)
    });

    if (!response.ok) {
        throw new Error(`Failed to create prediction: ${response.statusText}`);
    }

    return response.json();
}

export async function deletePredictionEntity(entityId) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/Prediction/${entityId}`, {
        method: 'DELETE',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to delete prediction: ${response.statusText}`);
    }

    return response.json();
}