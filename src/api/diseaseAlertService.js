// DiseaseAlert API Service
import { getApiConfig } from './apiConfig.js';

const getConfig = () => getApiConfig();

// Filterable fields: title, disease, severity, region, description, case_count, status, latitude, longitude
export async function fetchDiseaseAlertEntities(filters = {}) {
    const { baseUrl, appId, apiKey } = getConfig();
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${baseUrl}/${appId}/entities/DiseaseAlert${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch disease alerts: ${response.statusText}`);
    }

    return response.json();
}

export async function updateDiseaseAlertEntity(entityId, updateData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/DiseaseAlert/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        throw new Error(`Failed to update disease alert: ${response.statusText}`);
    }

    return response.json();
}

export async function createDiseaseAlertEntity(entityData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/DiseaseAlert`, {
        method: 'POST',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entityData)
    });

    if (!response.ok) {
        throw new Error(`Failed to create disease alert: ${response.statusText}`);
    }

    return response.json();
}

export async function deleteDiseaseAlertEntity(entityId) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/DiseaseAlert/${entityId}`, {
        method: 'DELETE',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to delete disease alert: ${response.statusText}`);
    }

    return response.json();
}