import { useState } from 'react';
import { api, Prediction as PredictionResult } from '../lib/api';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';

const AVAILABLE_SYMPTOMS = [
  'fever',
  'cough',
  'fatigue',
  'headache',
  'body_aches',
  'sore_throat',
  'runny_nose',
  'nausea',
  'vomiting',
  'diarrhea',
  'rash',
  'joint_pain',
  'difficulty_breathing',
  'chest_pain',
  'loss_of_taste',
  'loss_of_smell',
  'chills',
  'sweating',
];

const LOCATIONS = ['New York', 'California', 'Texas', 'Florida', 'Illinois'];

export default function Prediction() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [temperature, setTemperature] = useState<string>('37.0');
  const [humidity, setHumidity] = useState<string>('60');
  const [location, setLocation] = useState<string>('New York');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await api.predictDisease(
        selectedSymptoms,
        parseFloat(temperature),
        parseFloat(humidity),
        location
      );
      setPrediction(result);
    } catch (err) {
      setError('Failed to make prediction. Please ensure the backend is running and trained.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (score: number) => {
    if (score >= 0.8) return 'from-red-500 to-red-600';
    if (score >= 0.6) return 'from-orange-500 to-orange-600';
    if (score >= 0.4) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getSeverityText = (score: number) => {
    if (score >= 0.8) return 'High Risk';
    if (score >= 0.6) return 'Moderate Risk';
    if (score >= 0.4) return 'Low-Moderate Risk';
    return 'Low Risk';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Disease Prediction</h2>
        <p className="text-slate-600 mt-1">
          AI-powered disease prediction with explainable results
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>Input Symptoms & Data</span>
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Symptoms
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                {AVAILABLE_SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {symptom.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Selected: {selectedSymptoms.length} symptoms
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              onClick={handlePredict}
              disabled={loading || selectedSymptoms.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Analyzing...' : 'Predict Disease'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Prediction Results</span>
          </h3>

          {!prediction ? (
            <div className="flex items-center justify-center h-96 text-center">
              <div>
                <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  Select symptoms and click "Predict Disease" to see results
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Predicted Disease</p>
                    <h4 className="text-3xl font-bold text-slate-800 capitalize">
                      {prediction.predicted_disease}
                    </h4>
                  </div>
                  <div
                    className={`text-right bg-gradient-to-br ${getSeverityColor(
                      prediction.risk_score
                    )} text-white px-4 py-2 rounded-lg`}
                  >
                    <p className="text-xs opacity-90">Risk Score</p>
                    <p className="text-2xl font-bold">
                      {(prediction.risk_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getSeverityColor(
                        prediction.risk_score
                      )} transition-all`}
                      style={{ width: `${prediction.risk_score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {getSeverityText(prediction.risk_score)}
                  </span>
                </div>
              </div>

              {prediction.all_probabilities && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    All Disease Probabilities
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(prediction.all_probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([disease, prob]) => (
                        <div key={disease} className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {disease}
                            </span>
                            <span className="text-sm font-semibold text-slate-800">
                              {(prob * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                              style={{ width: `${prob * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Feature Importance (Explainability)
                </h4>
                <div className="space-y-2">
                  {Object.entries(prediction.explanation)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([feature, importance]) => (
                      <div key={feature} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {feature.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-slate-600">
                            {(importance * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full"
                            style={{ width: `${importance * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-600">
                  <strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(1)}% |
                  This prediction is based on federated learning models trained across multiple
                  hospitals without sharing patient data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
