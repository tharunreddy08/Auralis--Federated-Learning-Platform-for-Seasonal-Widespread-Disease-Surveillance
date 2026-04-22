import { Router } from 'express';
import mongoose from 'mongoose';
import { DiseaseAlert, PatientData, Prediction } from '../models/index.js';

const router = Router();

const parseFilters = (query = {}) => {
  const filter = {};

  if (query.region) {
    filter.region = query.region;
  }

  const start = query.startDate ? new Date(query.startDate) : null;
  const end = query.endDate ? new Date(query.endDate) : null;
  const validStart = start instanceof Date && !Number.isNaN(start?.getTime?.());
  const validEnd = end instanceof Date && !Number.isNaN(end?.getTime?.());

  if (validStart || validEnd) {
    filter.createdAt = {};
    if (validStart) filter.createdAt.$gte = start;
    if (validEnd) filter.createdAt.$lte = end;
  }

  return filter;
};

const recommendationFor = (alert) => {
  const severity = String(alert.severity || '').toLowerCase();
  const disease = String(alert.disease || '').toLowerCase();

  const severityActions = {
    low: ['Increase passive surveillance', 'Send prevention advisories'],
    medium: ['Activate district response unit', 'Increase testing throughput'],
    high: ['Open rapid response center', 'Deploy medical stock buffers'],
    critical: ['Trigger emergency command workflow', 'Escalate to national response unit']
  };

  const diseaseActions = {
    dengue: 'Prioritize vector control operations and water stagnation checks.',
    influenza: 'Scale vaccination and mask advisories in hotspots.',
    malaria: 'Increase anti-malarial stock and mosquito net distribution.',
    covid19: 'Increase testing and isolate high-transmission clusters.',
    cholera: 'Inspect water sanitation and chlorination coverage immediately.',
    tuberculosis: 'Expand contact tracing and treatment adherence checks.',
    typhoid: 'Strengthen food and water hygiene enforcement.',
    hepatitis: 'Run awareness and screening campaign for at-risk populations.'
  };

  return {
    immediate: severityActions[severity] || severityActions.medium,
    diseaseSpecific: diseaseActions[disease] || 'Coordinate with local medical officers for targeted intervention.'
  };
};

router.get('/heatmap-risk', async (req, res, next) => {
  try {
    const filter = parseFilters(req.query);

    const [patientAgg, alertAgg] = await Promise.all([
      PatientData.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { region: '$region', disease: '$disease' },
            cases: { $sum: 1 },
            lat: { $avg: '$latitude' },
            lng: { $avg: '$longitude' }
          }
        }
      ]),
      DiseaseAlert.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$region',
            activeAlerts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            highSeverity: {
              $sum: {
                $cond: [{ $in: ['$severity', ['high', 'critical']] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const alertMap = new Map(alertAgg.map((row) => [row._id || 'Unknown', row]));

    const points = patientAgg.map((row) => {
      const region = row._id?.region || 'Unknown';
      const disease = row._id?.disease || 'unknown';
      const alertInfo = alertMap.get(region) || { activeAlerts: 0, highSeverity: 0 };
      const riskScore = Math.min(100, row.cases * 2 + alertInfo.activeAlerts * 8 + alertInfo.highSeverity * 12);

      return {
        region,
        disease,
        cases: row.cases,
        riskScore,
        riskLevel: riskScore >= 70 ? 'critical' : riskScore >= 45 ? 'high' : riskScore >= 20 ? 'medium' : 'low',
        latitude: Number(row.lat) || null,
        longitude: Number(row.lng) || null
      };
    });

    return res.json({ items: points });
  } catch (error) {
    return next(error);
  }
});

router.get('/analytics', async (req, res, next) => {
  try {
    const filter = parseFilters(req.query);

    const [alerts, predictions] = await Promise.all([
      DiseaseAlert.find(filter).sort('-createdAt').limit(500),
      Prediction.find(filter).sort('-createdAt').limit(500)
    ]);

    const byRegion = new Map();
    const byDisease = new Map();
    const timeline = new Map();

    alerts.forEach((item) => {
      const region = item.region || 'Unknown';
      const disease = item.disease || 'unknown';
      const cases = Number(item.case_count || 0);
      const day = new Date(item.createdAt).toISOString().slice(0, 10);

      byRegion.set(region, (byRegion.get(region) || 0) + cases);
      byDisease.set(disease, (byDisease.get(disease) || 0) + cases);
      timeline.set(day, (timeline.get(day) || 0) + cases);
    });

    const avgConfidence =
      predictions.length > 0
        ? predictions.reduce((sum, prediction) => sum + Number(prediction.confidence || 0), 0) / predictions.length
        : 0;

    return res.json({
      filters: {
        region: req.query.region || null,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null
      },
      totals: {
        alerts: alerts.length,
        totalCases: alerts.reduce((sum, item) => sum + Number(item.case_count || 0), 0),
        predictions: predictions.length,
        avgConfidence: Number(avgConfidence.toFixed(3))
      },
      regionBreakdown: Array.from(byRegion.entries()).map(([name, value]) => ({ name, value })),
      diseaseBreakdown: Array.from(byDisease.entries()).map(([name, value]) => ({ name, value })),
      timeline: Array.from(timeline.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date))
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/alerts/:id/details', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid alert id.' });
    }

    const alert = await DiseaseAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found.' });
    }

    return res.json({
      alert,
      recommendations: recommendationFor(alert)
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/reports/summary', async (req, res, next) => {
  try {
    const filter = parseFilters(req.query);
    const alerts = await DiseaseAlert.find(filter).sort('-createdAt').limit(1000);

    const totalsByMonth = new Map();
    const bySeverity = new Map();
    const topRegions = new Map();

    alerts.forEach((alert) => {
      const month = new Date(alert.createdAt).toISOString().slice(0, 7);
      const severity = alert.severity || 'unknown';
      const region = alert.region || 'Unknown';
      const cases = Number(alert.case_count || 0);

      totalsByMonth.set(month, (totalsByMonth.get(month) || 0) + cases);
      bySeverity.set(severity, (bySeverity.get(severity) || 0) + 1);
      topRegions.set(region, (topRegions.get(region) || 0) + cases);
    });

    return res.json({
      totalAlerts: alerts.length,
      totalCases: alerts.reduce((sum, alert) => sum + Number(alert.case_count || 0), 0),
      outbreakTrend: Array.from(totalsByMonth.entries())
        .map(([month, cases]) => ({ month, cases }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      severityBreakdown: Array.from(bySeverity.entries()).map(([name, value]) => ({ name, value })),
      topRegions: Array.from(topRegions.entries())
        .map(([region, cases]) => ({ region, cases }))
        .sort((a, b) => b.cases - a.cases)
        .slice(0, 8)
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
