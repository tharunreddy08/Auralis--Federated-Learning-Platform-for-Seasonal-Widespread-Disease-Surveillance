// ModelUpdate API Service
import { getApiConfig } from './apiConfig.js';

const getConfig = () => getApiConfig();

// Filterable fields: hospital_id, hospital_name, model_type, accuracy, loss, training_samples, round_number, status, weights_hash
export async function fetchModelUpdateEntities(filters = {}) {
    const { baseUrl, appId, apiKey } = getConfig();
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${baseUrl}/${appId}/entities/ModelUpdate${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch model updates: ${response.statusText}`);
    }

    return response.json();
}

export async function updateModelUpdateEntity(entityId, updateData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/ModelUpdate/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        throw new Error(`Failed to update model update: ${response.statusText}`);
    }

    return response.json();
}

export async function createModelUpdateEntity(entityData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/ModelUpdate`, {
        method: 'POST',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entityData)
    });

    if (!response.ok) {
        throw new Error(`Failed to create model update: ${response.statusText}`);
    }

    return response.json();
}

export async function deleteModelUpdateEntity(entityId) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/ModelUpdate/${entityId}`, {
        method: 'DELETE',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to delete model update: ${response.statusText}`);
    }

    return response.json();
}