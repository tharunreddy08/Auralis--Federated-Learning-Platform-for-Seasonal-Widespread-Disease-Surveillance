export const hospitals = [
  {
    name: 'City General Hospital',
    code: 'CGH-001',
    location: 'Lagos Mainland',
    latitude: 6.5244,
    longitude: 3.3792,
    status: 'active',
    total_patients: 412,
    contact_email: 'admin.cgh@auralis.local',
    region: 'Southwest'
  },
  {
    name: 'Rivers State Medical Center',
    code: 'RSMC-002',
    location: 'Port Harcourt',
    latitude: 4.8156,
    longitude: 7.0498,
    status: 'active',
    total_patients: 287,
    contact_email: 'ops.rsmc@auralis.local',
    region: 'Southsouth'
  },
  {
    name: 'Abuja Specialist Hospital',
    code: 'ASH-003',
    location: 'Abuja Municipal',
    latitude: 9.0765,
    longitude: 7.3986,
    status: 'active',
    total_patients: 350,
    contact_email: 'info.ash@auralis.local',
    region: 'Northcentral'
  }
];

export const patientData = [
  {
    hospital_name: 'City General Hospital',
    disease: 'dengue',
    age: 34,
    gender: 'female',
    symptoms: 'fever, headache, nausea',
    severity: 'moderate',
    outcome: 'under_treatment',
    report_date: new Date('2026-04-10T09:15:00Z'),
    latitude: 6.52,
    longitude: 3.37,
    region: 'Southwest'
  },
  {
    hospital_name: 'Rivers State Medical Center',
    disease: 'cholera',
    age: 22,
    gender: 'male',
    symptoms: 'watery stool, vomiting, dehydration',
    severity: 'severe',
    outcome: 'under_treatment',
    report_date: new Date('2026-04-11T11:20:00Z'),
    latitude: 4.81,
    longitude: 7.05,
    region: 'Southsouth'
  },
  {
    hospital_name: 'Abuja Specialist Hospital',
    disease: 'influenza',
    age: 41,
    gender: 'other',
    symptoms: 'cough, sore throat, fever',
    severity: 'mild',
    outcome: 'recovered',
    report_date: new Date('2026-04-09T07:40:00Z'),
    latitude: 9.08,
    longitude: 7.40,
    region: 'Northcentral'
  }
];

export const diseaseAlerts = [
  {
    title: 'Dengue cluster in Lagos',
    disease: 'dengue',
    severity: 'high',
    region: 'Southwest',
    description: 'Increased cases reported across three local districts.',
    case_count: 129,
    status: 'active',
    latitude: 6.52,
    longitude: 3.37
  },
  {
    title: 'Cholera waterborne risk',
    disease: 'cholera',
    severity: 'critical',
    region: 'Southsouth',
    description: 'Rapid onset linked to contaminated neighborhood wells.',
    case_count: 84,
    status: 'monitoring',
    latitude: 4.81,
    longitude: 7.05
  }
];

export const modelUpdates = [
  {
    hospital_name: 'City General Hospital',
    model_type: 'gradient_boosting',
    accuracy: 0.93,
    loss: 0.12,
    training_samples: 1240,
    round_number: 7,
    status: 'pending',
    weights_hash: 'lagos7ab2'
  },
  {
    hospital_name: 'Abuja Specialist Hospital',
    model_type: 'random_forest',
    accuracy: 0.91,
    loss: 0.15,
    training_samples: 980,
    round_number: 7,
    status: 'aggregated',
    weights_hash: 'abuja7rf9'
  }
];

export const predictions = [
  {
    disease: 'dengue',
    region: 'Southwest',
    predicted_cases: 165,
    confidence: 0.89,
    prediction_date: new Date('2026-04-14T00:00:00Z'),
    model_version: 'v2.1.4',
    trend: 'increasing'
  },
  {
    disease: 'influenza',
    region: 'Northcentral',
    predicted_cases: 72,
    confidence: 0.84,
    prediction_date: new Date('2026-04-14T00:00:00Z'),
    model_version: 'v2.1.4',
    trend: 'stable'
  }
];
