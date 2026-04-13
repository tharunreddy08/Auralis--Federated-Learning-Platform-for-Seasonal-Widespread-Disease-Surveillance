// PatientData API Service
import { getApiConfig } from './apiConfig.js';

const getConfig = () => getApiConfig();

// Filterable fields: hospital_id, hospital_name, disease, age, gender, symptoms, severity, outcome, report_date, latitude, longitude, region
export async function fetchPatientDataEntities(filters = {}) {
    const { baseUrl, appId, apiKey } = getConfig();
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${baseUrl}/${appId}/entities/PatientData${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch patient data: ${response.statusText}`);
    }

    return response.json();
}

export async function updatePatientDataEntity(entityId, updateData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/PatientData/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        throw new Error(`Failed to update patient data: ${response.statusText}`);
    }

    return response.json();
}

export async function createPatientDataEntity(entityData) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/PatientData`, {
        method: 'POST',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entityData)
    });

    if (!response.ok) {
        throw new Error(`Failed to create patient data: ${response.statusText}`);
    }

    return response.json();
}

export async function deletePatientDataEntity(entityId) {
    const { baseUrl, appId, apiKey } = getConfig();
    const response = await fetch(`${baseUrl}/${appId}/entities/PatientData/${entityId}`, {
        method: 'DELETE',
        headers: {
            'api_key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to delete patient data: ${response.statusText}`);
    }

    return response.json();
}