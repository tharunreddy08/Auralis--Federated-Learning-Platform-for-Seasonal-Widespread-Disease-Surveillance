import { apiRequest, buildUrl } from './httpClient.js';

export const fetchAdminModelPerformance = (filters = {}) => apiRequest('/admin/model-performance', { query: filters });
export const fetchAdminUsers = () => apiRequest('/admin/users');
export const fetchAdminReportAnalytics = (filters = {}) => apiRequest('/admin/reports/analytics', { query: filters });
export const fetchAdminSystemLogs = (limit = 80) => apiRequest('/admin/system-logs', { query: { limit } });

export const downloadAdminReport = async (format = 'csv', filters = {}) => {
  const url = buildUrl('/admin/reports/export', {
    format,
    ...filters
  });

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to export report');
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = format === 'pdf' ? 'auralis-report.pdf' : 'auralis-report.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(downloadUrl);
};

export const fetchHospitalDataHistory = (filters = {}) => apiRequest('/hospital/data-history', { query: filters });
export const fetchHospitalTrainingHistory = (filters = {}) => apiRequest('/hospital/training-history', { query: filters });
export const fetchHospitalModelPerformance = (filters = {}) => apiRequest('/hospital/model-performance', { query: filters });
export const validateHospitalRecords = (records = []) => apiRequest('/hospital/validate-data', { method: 'POST', body: { records } });

export const fetchOfficialHeatmapRisk = (filters = {}) => apiRequest('/official/heatmap-risk', { query: filters });
export const fetchOfficialAnalytics = (filters = {}) => apiRequest('/official/analytics', { query: filters });
export const fetchOfficialAlertDetail = (id) => apiRequest(`/official/alerts/${id}/details`);
export const fetchOfficialReportSummary = (filters = {}) => apiRequest('/official/reports/summary', { query: filters });
