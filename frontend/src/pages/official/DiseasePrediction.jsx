import { useEffect, useMemo, useState } from "react";
import { predictDisease } from "@/api/predictionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const symptomOptions = [
  { id: "fever", label: "fever" },
  { id: "cough", label: "cough" },
  { id: "headache", label: "headache" },
  { id: "fatigue", label: "fatigue" },
  { id: "body_ache", label: "body ache" },
  { id: "sore_throat", label: "sore throat" },
  { id: "nausea", label: "nausea" },
  { id: "diarrhea", label: "diarrhea" },
  { id: "rash", label: "rash" },
  { id: "shortness_of_breath", label: "shortness of breath" },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const levelFromScore = (score) => {
  if (score >= 65) return "high";
  if (score >= 35) return "medium";
  return "low";
};

const levelClasses = {
  high: {
    bar: "bg-red-500",
    badge: "border-red-200 text-red-500",
  },
  medium: {
    bar: "bg-violet-500",
    badge: "border-violet-200 text-violet-500",
  },
  low: {
    bar: "bg-teal-500",
    badge: "border-teal-200 text-teal-500",
  },
};

export default function DiseasePrediction() {
  const [symptoms, setSymptoms] = useState({
    fever: false,
    cough: false,
    headache: false,
    fatigue: false,
    body_ache: false,
    sore_throat: false,
    nausea: false,
    diarrhea: false,
    rash: false,
    shortness_of_breath: false,
  });

  const [vitals, setVitals] = useState({
    temperature: "",
    humidity: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedCount = useMemo(
    () => Object.values(symptoms).filter(Boolean).length,
    [symptoms]
  );

  const handleSymptomChange = (symptom) => {
    setSymptoms((prev) => ({
      ...prev,
      [symptom]: !prev[symptom],
    }));
  };

  const handleVitalChange = (vital, value) => {
    setVitals((prev) => ({
      ...prev,
      [vital]: value,
    }));
  };

  const runPrediction = async (showValidation = true) => {
    try {
      if (showValidation) {
        setError(null);
      }

      // Validation
      if (!vitals.temperature || !vitals.humidity) {
        if (showValidation) {
          setError("Please enter temperature and humidity values");
        }
        return;
      }

      const tempF = parseFloat(vitals.temperature);
      const humidity = parseFloat(vitals.humidity);

      if (isNaN(tempF) || isNaN(humidity)) {
        if (showValidation) {
          setError("Temperature and humidity must be valid numbers");
        }
        return;
      }

      if (tempF < 90 || tempF > 110) {
        if (showValidation) {
          setError("Temperature should be between 90°F and 110°F");
        }
        return;
      }

      if (humidity < 0 || humidity > 100) {
        if (showValidation) {
          setError("Humidity should be between 0% and 100%");
        }
        return;
      }

      setLoading(true);

      const temperatureC = ((tempF - 32) * 5) / 9;

      const requestData = {
        fever: symptoms.fever ? 1 : 0,
        cough: symptoms.cough ? 1 : 0,
        headache: symptoms.headache ? 1 : 0,
        fatigue: symptoms.fatigue ? 1 : 0,
        body_ache: symptoms.body_ache ? 1 : 0,
        sore_throat: symptoms.sore_throat ? 1 : 0,
        nausea: symptoms.nausea ? 1 : 0,
        diarrhea: symptoms.diarrhea ? 1 : 0,
        rash: symptoms.rash ? 1 : 0,
        shortness_of_breath: symptoms.shortness_of_breath ? 1 : 0,
        temperature: temperatureC,
        humidity: humidity,
      };

      const result = await predictDisease(requestData);
      setPrediction(result);

      const fallbackTempScore = clamp(((tempF - 98.6) / 8) * 100, 0, 100);
      const fallbackHumidityScore = clamp((humidity / 100) * 100, 0, 100);

      setRiskScore(Number.isFinite(result?.riskScore) ? result.riskScore : Math.round(
        clamp(10 + selectedCount * 7 + fallbackTempScore * 0.25 + fallbackHumidityScore * 0.1, 0, 100)
      ));

      setFactors(
        Array.isArray(result?.factors) && result.factors.length > 0
          ? result.factors
          : [
              { key: "fever", score: symptoms.fever ? 78 : 10 },
              { key: "temperature", score: fallbackTempScore },
              { key: "humidity", score: fallbackHumidityScore },
              { key: "cough", score: symptoms.cough ? 70 : 8 },
              { key: "headache", score: symptoms.headache ? 66 : 8 },
            ]
      );
    } catch (err) {
      if (showValidation) {
        setError(err.message || "Prediction failed. Please try again.");
      }
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    await runPrediction(true);
  };

  useEffect(() => {
    if (!vitals.temperature || !vitals.humidity) {
      return;
    }

    const debounce = setTimeout(() => {
      runPrediction(false);
    }, 250);

    return () => clearTimeout(debounce);
  }, [
    symptoms,
    vitals.temperature,
    vitals.humidity,
  ]);

  const confidencePercent = Math.round((prediction?.confidence || 0) * 100);
  const displayedRiskLevel = prediction?.riskLevel || levelFromScore(riskScore);

  return (
    <div className="space-y-7">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Disease Prediction</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered diagnosis with explainable results</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Select Symptoms</h3>
              <div className="flex flex-wrap gap-2.5">
                {symptomOptions.map((symptom) => {
                  const active = symptoms[symptom.id];
                  return (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => handleSymptomChange(symptom.id)}
                      className={`h-10 px-4 rounded-2xl border text-xl font-medium capitalize transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {symptom.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-semibold">Environmental Factors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature (°F)
                  </div>
                  <Input
                    type="number"
                    placeholder="99"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalChange("temperature", e.target.value)}
                    step="0.1"
                    min="90"
                    max="110"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Humidity (%)
                  </div>
                  <Input
                    type="number"
                    placeholder="65"
                    value={vitals.humidity}
                    onChange={(e) => handleVitalChange("humidity", e.target.value)}
                    step="1"
                    min="0"
                    max="100"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handlePredict}
            disabled={loading}
            className="w-full h-12 text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Predict Disease
              </>
            )}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </motion.div>

        <motion.div className="space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-primary/30 bg-primary/10">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Predicted Disease</p>
              <h2 className="text-4xl font-bold text-primary">{prediction?.prediction || "--"}</h2>
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <div className="border-r border-border/70 pr-4">
                  <p className="text-4xl font-bold text-primary">{prediction ? riskScore : "--"}</p>
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-violet-500">{prediction ? `${confidencePercent}%` : "--"}</p>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                </div>
              </div>
              {prediction && (
                <div>
                  <Badge
                    variant="outline"
                    className={`rounded-full capitalize ${levelClasses[displayedRiskLevel].badge}`}
                  >
                    {displayedRiskLevel} risk
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-base font-semibold">Explainable AI - Why this prediction?</h3>

              {(factors.length > 0
                ? factors
                : [
                    { key: "fever", score: 0 },
                    { key: "rash", score: 0 },
                    { key: "temperature", score: 0 },
                    { key: "humidity", score: 0 },
                    { key: "sore throat", score: 0 },
                  ]
              ).map((factor) => {
                const level = levelFromScore(factor.score);
                const styles = levelClasses[level];

                return (
                  <div key={factor.key} className="grid grid-cols-[140px_1fr_auto] items-center gap-3">
                    <p className="text-sm capitalize">{factor.key}</p>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${styles.bar}`} style={{ width: `${factor.score}%` }} />
                    </div>
                    <Badge variant="outline" className={`rounded-full capitalize ${styles.badge}`}>
                      {level}
                    </Badge>
                  </div>
                );
              })}

              {prediction?.timestamp && (
                <p className="text-xs text-muted-foreground pt-1">
                  Prediction time: {new Date(prediction.timestamp).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {!prediction && !loading && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Select symptoms, enter environmental factors, and click Predict Disease.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
