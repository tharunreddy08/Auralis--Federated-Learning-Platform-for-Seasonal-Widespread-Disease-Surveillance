// API Configuration
import { appParams } from '@/lib/app-params';

const getApiConfig = () => {
    const { appId, token } = appParams;

    if (!appId) {
        throw new Error('Missing Base44 appId. Set VITE_BASE44_APP_ID or pass app_id in URL.');
    }

    if (!token) {
        throw new Error('Missing Base44 access token. Pass access_token in URL or local storage.');
    }

    return {
        baseUrl: 'https://base44.app/api/apps',
        appId,
        apiKey: token
    };
};

export { getApiConfig };