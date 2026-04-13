// Hospital API Service
import { getApiConfig } from './apiConfig.js';

const getConfig = () => getApiConfig();

// Filterable fields: name, code, location, latitude, longitude, status, total_patients, last_model_update, contact_email, region
export async function fetchHospitalEntities(filters = {}) {
    const { baseUrl, appId, apiKey } = getConfig();
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${baseUrl}/${appId}/entities/Hospital${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch hospitals: ${response.statusText}`);
    }

    return response.json();
}

export async function updateHospitalEntity(entityId, updateData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/Hospital/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        throw new Error(`Failed to update hospital: ${response.statusText}`);
    }

    return response.json();
}

export async function createHospitalEntity(entityData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/Hospital`, {
        method: 'POST',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entityData)
    });

    if (!response.ok) {
        throw new Error(`Failed to create hospital: ${response.statusText}`);
    }

    return response.json();
}

export async function deleteHospitalEntity(entityId) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/Hospital/${entityId}`, {
        method: 'DELETE',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to delete hospital: ${response.statusText}`);
    }

    return response.json();
}