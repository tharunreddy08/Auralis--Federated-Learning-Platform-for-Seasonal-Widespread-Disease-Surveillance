import { useEffect, useState } from 'react';
import { Hospital, DiseaseCase, FederatedLearningResult, api, TrainingStats } from '../lib/api';
import { Building2, Database, Shield, Play, CheckCircle2, Loader2 } from 'lucide-react';

export default function HospitalSimulation() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [hospitalCases, setHospitalCases] = useState<DiseaseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState<FederatedLearningResult | null>(null);

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      loadHospitalCases(selectedHospital);
    }
  }, [selectedHospital]);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const data = await api.getHospitals();
      setHospitals(data);
      if (data.length > 0) {
        setSelectedHospital(data[0].id);
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitalCases = async (hospitalId: string) => {
    try {
      const cases = await api.getHospitalCases(hospitalId);
      setHospitalCases(cases);
    } catch (error) {
      console.error('Error loading hospital cases:', error);
    }
  };

  const runFederatedTraining = async () => {
    try {
      setTraining(true);
      setTrainingResult(null);
      // Avoid duplicate `global_models.round_number` unique constraint errors.
      // Always request the next round number based on the backend state.
      const status = await api.getFederatedLearningStatus();
      const nextRoundNumber = (status.current_round?.round_number ?? 0) + 1;

      const response = await api.runFederatedLearning(nextRoundNumber, 10);
      setTrainingResult(response.result);
    } catch (error: unknown) {
      console.error('Error running federated learning:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : JSON.stringify(error);
      alert(
        `Failed to run federated learning. Make sure the backend is running.\nDetails: ${errorMessage}`
      );
    } finally {
      setTraining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  const selectedHospitalData = hospitals.find((h) => h.id === selectedHospital);

  const diseaseCounts = hospitalCases.reduce((acc, c) => {
    acc[c.disease] = (acc[c.disease] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Hospital Simulation</h2>
          <p className="text-slate-600 mt-1">
            Federated learning across multiple hospitals without sharing raw data
          </p>
        </div>
        <button
          onClick={runFederatedTraining}
          disabled={training}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {training ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Training...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Run Federated Learning</span>
            </>
          )}
        </button>
      </div>

      {trainingResult && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">
              Training Completed Successfully
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-600">Global Accuracy</p>
              <p className="text-2xl font-bold text-slate-800">
                {(trainingResult.global_accuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-600">Participating Hospitals</p>
              <p className="text-2xl font-bold text-slate-800">
                {trainingResult.participating_hospitals}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-600">Round Number</p>
              <p className="text-2xl font-bold text-slate-800">
                {trainingResult.round_number}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Hospital Statistics:</p>
            {trainingResult.training_stats.map((stat: TrainingStats) => (
              <div
                key={stat.hospital_id}
                className="bg-white rounded-lg p-3 flex items-center justify-between"
              >
                <span className="font-medium text-slate-700">{stat.hospital_name}</span>
                <div className="flex space-x-4 text-sm">
                  <span className="text-slate-600">
                    Samples: <span className="font-semibold">{stat.samples_trained}</span>
                  </span>
                  <span className="text-slate-600">
                    Accuracy: <span className="font-semibold">{(stat.accuracy * 100).toFixed(1)}%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Privacy Preservation</h4>
            <p className="text-sm text-blue-800">
              Patient data remains at each hospital. Only model weights are shared during
              federated learning, ensuring complete data privacy and compliance with regulations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Hospitals</span>
          </h3>
          <div className="space-y-2">
            {hospitals.map((hospital) => (
              <button
                key={hospital.id}
                onClick={() => setSelectedHospital(hospital.id)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedHospital === hospital.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-slate-50 border-2 border-transparent hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-800">{hospital.name}</div>
                <div className="text-sm text-slate-600 mt-1">{hospital.location}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">
                    Trust Score: {(hospital.trust_score * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {hospital.total_cases} cases
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {selectedHospitalData && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {selectedHospitalData.name}
                  </h3>
                  <p className="text-sm text-slate-600">{selectedHospitalData.location}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Database className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{hospitalCases.length} cases</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Disease Distribution
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(diseaseCounts).map(([disease, count]) => (
                    <div
                      key={disease}
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200"
                    >
                      <div className="text-sm text-slate-600 capitalize">{disease}</div>
                      <div className="text-xl font-bold text-slate-800 mt-1">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Recent Cases (Local Data - Not Shared)
                </h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {hospitalCases.slice(0, 20).map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-slate-800 capitalize">
                            {c.disease}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{c.date}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.symptoms.slice(0, 5).map((symptom, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white text-slate-600 px-2 py-1 rounded border border-slate-200"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Temp: {c.temperature}°C | Humidity: {c.humidity}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
