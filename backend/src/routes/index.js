import { Router } from 'express';
import { DiseaseAlert, Hospital, ModelUpdate, PatientData, Prediction } from '../models/index.js';
import { createCrudRouter } from './createCrudRouter.js';
import adminFeatureRoutes from './adminFeatureRoutes.js';
import hospitalFeatureRoutes from './hospitalFeatureRoutes.js';
import officialFeatureRoutes from './officialFeatureRoutes.js';

const router = Router();

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const computePrediction = (input) => {
  const fever = Number(input.fever) || 0;
  const cough = Number(input.cough) || 0;
  const headache = Number(input.headache) || 0;
  const fatigue = Number(input.fatigue) || 0;
  const bodyAche = Number(input.body_ache) || 0;
  const soreThroat = Number(input.sore_throat) || 0;
  const nausea = Number(input.nausea) || 0;
  const diarrhea = Number(input.diarrhea) || 0;
  const rash = Number(input.rash) || 0;
  const shortBreath = Number(input.shortness_of_breath) || 0;
  const temperature = Number(input.temperature);
  const humidity = Number(input.humidity);

  const tempBoost = clamp((temperature - 36.8) * 20, 0, 36);
  const highHumidity = clamp((humidity - 60) * 0.8, 0, 20);
  const lowHumidity = clamp((55 - humidity) * 0.8, 0, 18);

  const totalSymptoms =
    fever + cough + headache + fatigue + bodyAche + soreThroat + nausea + diarrhea + rash + shortBreath;

  const allSymptomsSelected = totalSymptoms >= 10;

  if (allSymptomsSelected && fever && rash && headache) {
    const forcedConfidence = clamp(0.86 + tempBoost / 180, 0.86, 0.96);
    return {
      prediction: 'Dengue',
      confidence: Number(forcedConfidence.toFixed(2)),
      diseaseKey: 'dengue',
      riskScore: Math.round(clamp(84 + tempBoost * 0.4 + highHumidity * 0.3, 0, 100)),
      riskLevel: 'high',
      factors: [
        { key: 'fever', score: 90 },
        { key: 'rash', score: 86 },
        { key: 'temperature', score: clamp(tempBoost * 2.2, 0, 100) },
        { key: 'humidity', score: clamp((humidity / 100) * 100, 0, 100) },
        { key: 'body ache', score: 82 }
      ]
    };
  }

  const dengueScore =
    fever * 22 +
    headache * 18 +
    bodyAche * 14 +
    rash * 16 +
    nausea * 12 +
    totalSymptoms * 2.4 +
    tempBoost * 0.7 +
    highHumidity * 0.7;

  const covidScore =
    fever * 16 +
    cough * 24 +
    fatigue * 12 +
    soreThroat * 15 +
    shortBreath * 20 +
    tempBoost * 0.6 +
    lowHumidity * 0.5;

  const malariaScore =
    fever * 24 +
    headache * 16 +
    fatigue * 16 +
    nausea * 13 +
    diarrhea * 10 +
    tempBoost * 0.8 +
    highHumidity * 0.6;

  const riskScore = clamp(
    8 + totalSymptoms * 7 + tempBoost * 0.6 + (humidity > 75 ? 6 : 0) + (shortBreath ? 8 : 0),
    0,
    100
  );

  const riskLevel = riskScore >= 65 ? 'high' : riskScore >= 35 ? 'medium' : 'low';

  const scored = [
    { label: 'Dengue', key: 'dengue', score: dengueScore },
    { label: 'COVID-19', key: 'covid19', score: covidScore },
    { label: 'Malaria', key: 'malaria', score: malariaScore }
  ].sort((a, b) => b.score - a.score);

  const top = scored[0];

  if (riskScore < 28 || top.score < 26) {
    return {
      prediction: 'Low Risk',
      confidence: 0.6,
      diseaseKey: null,
      riskScore: Math.round(riskScore),
      riskLevel,
      factors: [
        { key: 'fever', score: fever ? 70 : 10 },
        { key: 'temperature', score: clamp(tempBoost * 2.2, 0, 100) },
        { key: 'humidity', score: clamp((humidity / 100) * 100, 0, 100) },
        { key: 'cough', score: cough ? 65 : 8 },
        { key: 'fatigue', score: fatigue ? 58 : 8 }
      ]
    };
  }

  const runnerUp = scored[1];
  const confidence = clamp(0.58 + (top.score - runnerUp.score) / 110 + riskScore / 260, 0.58, 0.96);

  return {
    prediction: top.label,
    confidence: Number(confidence.toFixed(2)),
    diseaseKey: top.key,
    riskScore: Math.round(riskScore),
    riskLevel,
    factors: [
      { key: 'fever', score: fever ? 78 : 10 },
      { key: 'temperature', score: clamp(tempBoost * 2.2, 0, 100) },
      { key: 'humidity', score: clamp((humidity / 100) * 100, 0, 100) },
      { key: 'cough', score: cough ? 75 : 8 },
      { key: 'headache', score: headache ? 72 : 8 }
    ]
  };
};

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.post('/predict-disease', async (req, res, next) => {
  try {
    const {
      fever = 0,
      cough = 0,
      headache = 0,
      fatigue = 0,
      body_ache = 0,
      sore_throat = 0,
      nausea = 0,
      diarrhea = 0,
      rash = 0,
      shortness_of_breath = 0,
      temperature,
      humidity
    } = req.body || {};

    if (temperature === undefined || humidity === undefined) {
      return res.status(400).json({ message: 'temperature and humidity are required.' });
    }

    const parsedTemperature = Number(temperature);
    const parsedHumidity = Number(humidity);

    if (Number.isNaN(parsedTemperature) || Number.isNaN(parsedHumidity)) {
      return res.status(400).json({ message: 'temperature and humidity must be valid numbers.' });
    }

    const result = computePrediction({
      fever,
      cough,
      headache,
      fatigue,
      body_ache,
      sore_throat,
      nausea,
      diarrhea,
      rash,
      shortness_of_breath,
      temperature: parsedTemperature,
      humidity: parsedHumidity
    });

    if (result.diseaseKey) {
      await Prediction.create({
        disease: result.diseaseKey,
        region: 'Unknown',
        predicted_cases: 1,
        confidence: result.confidence,
        prediction_date: new Date(),
        model_version: 'heuristic-v1',
        trend: 'stable'
      });
    }

    return res.json({
      prediction: result.prediction,
      confidence: result.confidence,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      factors: result.factors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
});

router.use('/disease-alerts', createCrudRouter(DiseaseAlert));
router.use('/hospitals', createCrudRouter(Hospital));
router.use('/model-updates', createCrudRouter(ModelUpdate));
router.use('/patient-data', createCrudRouter(PatientData));
router.use('/predictions', createCrudRouter(Prediction));

router.use('/admin', adminFeatureRoutes);
router.use('/hospital', hospitalFeatureRoutes);
router.use('/official', officialFeatureRoutes);

export default router;
