const API_BASE_URL = 'http://localhost:8000/api';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  trust_score: number;
  total_cases: number;
  created_at: string;
}

export interface DiseaseCase {
  id: string;
  hospital_id: string;
  disease: string;
  symptoms: string[];
  temperature: number;
  humidity: number;
  date: string;
  patient_age?: number;
  patient_gender?: string;
  created_at: string;
}

export interface Prediction {
  predicted_disease: string;
  risk_score: number;
  confidence: number;
  all_probabilities?: Record<string, number>;
  explanation: Record<string, number>;
}

export interface Alert {
  id: string;
  hospital_id?: string;
  location: string;
  disease: string;
  case_count: number;
  threshold: number;
  severity: string;
  status: string;
  alert_date: string;
  created_at: string;
}

export interface TrainingStats {
  hospital_id: string;
  hospital_name: string;
  samples_trained: number;
  accuracy: number;
  loss: number;
}

export interface FederatedLearningResult {
  round_number: number;
  global_accuracy: number;
  participating_hospitals: number;
  training_stats: TrainingStats[];
}

export interface DashboardStats {
  total_hospitals: number;
  total_cases: number;
  active_alerts: number;
  model_accuracy: number;
  disease_distribution: Record<string, number>;
  recent_cases_count: number;
  trend_data: Array<{ date: string; count: number }>;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskMapPoint {
  zone: string;
  lat: number;
  lng: number;
  risk_level: RiskLevel;
  cases: number;
}

export const api = {
  async getHospitals(): Promise<Hospital[]> {
    const response = await fetch(`${API_BASE_URL}/hospitals`);
    if (!response.ok) throw new Error('Failed to fetch hospitals');
    return response.json();
  },

  async getHospitalCases(hospitalId: string): Promise<DiseaseCase[]> {
    const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/cases`);
    if (!response.ok) throw new Error('Failed to fetch hospital cases');
    return response.json();
  },

  async getDiseaseCases(limit: number = 100): Promise<DiseaseCase[]> {
    const response = await fetch(`${API_BASE_URL}/disease-cases?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch disease cases');
    return response.json();
  },

  async getDiseaseStats() {
    const response = await fetch(`${API_BASE_URL}/disease-cases/stats`);
    if (!response.ok) throw new Error('Failed to fetch disease stats');
    return response.json();
  },

  async runFederatedLearning(roundNumber: number = 1, epochs: number = 10): Promise<{ result: FederatedLearningResult }> {
    const response = await fetch(`${API_BASE_URL}/federated-learning/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round_number: roundNumber, epochs }),
    });
    if (!response.ok) throw new Error('Failed to run federated learning');
    return response.json();
  },

  async getFederatedLearningStatus() {
    const response = await fetch(`${API_BASE_URL}/federated-learning/status`);
    if (!response.ok) throw new Error('Failed to fetch FL status');
    return response.json();
  },

  async predictDisease(
    symptoms: string[],
    temperature: number,
    humidity: number,
    location: string
  ): Promise<Prediction> {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, temperature, humidity, location }),
    });
    if (!response.ok) throw new Error('Failed to predict disease');
    return response.json();
  },

  async getPredictions(limit: number = 50) {
    const response = await fetch(`${API_BASE_URL}/predictions?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch predictions');
    return response.json();
  },

  async getAlerts(status?: string): Promise<Alert[]> {
    const url = status
      ? `${API_BASE_URL}/alerts?status=${status}`
      : `${API_BASE_URL}/alerts`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },

  async detectAlerts() {
    const response = await fetch(`${API_BASE_URL}/alerts/detect`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to detect alerts');
    return response.json();
  },

  async seedData() {
    const response = await fetch(`${API_BASE_URL}/seed-data`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to seed data');
    return response.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  async getRiskMap(days: number = 7): Promise<RiskMapPoint[]> {
    const response = await fetch(`${API_BASE_URL}/risk-map?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch risk map');
    return response.json();
  },
};
