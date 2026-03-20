import { useEffect, useState } from 'react';
import { api, Alert } from '../lib/api';
import { AlertTriangle, MapPin, Calendar, TrendingUp, Shield } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const data = await api.getAlerts(status);
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      case 'low':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Outbreak Alerts</h2>
        <p className="text-slate-600 mt-1">
          Early warning system for disease outbreak detection
        </p>
      </div>

      {criticalAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Critical Outbreak Warning
              </h3>
              <p className="text-red-800 mb-4">
                {criticalAlerts.length} critical {criticalAlerts.length === 1 ? 'alert' : 'alerts'} requiring immediate attention.
                Case thresholds have been significantly exceeded in multiple locations.
              </p>
              <div className="flex flex-wrap gap-2">
                {criticalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white rounded-lg px-3 py-2 border border-red-200"
                  >
                    <span className="text-sm font-semibold text-red-900 capitalize">
                      {alert.disease}
                    </span>
                    <span className="text-sm text-red-700 ml-2">
                      in {alert.location}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Alerts</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{alerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Active Alerts</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{activeAlerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Critical Alerts</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{criticalAlerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Alert Details</h3>
          <div className="flex space-x-2">
            {['all', 'active', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No alerts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl p-6 border-2 transition-all hover:shadow-md ${getSeverityBgColor(
                  alert.severity
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alert.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {alert.status.toUpperCase()}
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-slate-800 mb-2 capitalize">
                      {alert.disease} Outbreak
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-slate-700">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{alert.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {new Date(alert.alert_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {alert.case_count} cases
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Cases vs Threshold</span>
                        <span className="text-sm font-semibold text-slate-800">
                          {alert.case_count} / {alert.threshold}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getSeverityColor(
                            alert.severity
                          )} transition-all`}
                          style={{
                            width: `${Math.min(
                              (alert.case_count / alert.threshold) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {alert.case_count > alert.threshold
                          ? `${alert.case_count - alert.threshold} cases above threshold`
                          : 'Within threshold'}
                      </p>
                    </div>
                  </div>

                  <div className="ml-6 flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${getSeverityColor(
                        alert.severity
                      )} flex items-center justify-center ${
                        alert.status === 'active' ? 'animate-pulse' : ''
                      }`}
                    >
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
