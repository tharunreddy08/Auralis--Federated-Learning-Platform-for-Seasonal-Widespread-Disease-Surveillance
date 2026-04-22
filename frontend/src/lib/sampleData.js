// Sample data for the Auralis platform
export const diseases = ["influenza", "dengue", "malaria", "covid19", "cholera", "tuberculosis", "typhoid", "hepatitis"];

export const regions = [
  { name: "North Region", lat: 28.6, lng: 77.2 },
  { name: "South Region", lat: 13.0, lng: 80.2 },
  { name: "East Region", lat: 22.5, lng: 88.3 },
  { name: "West Region", lat: 19.0, lng: 72.8 },
  { name: "Central Region", lat: 23.2, lng: 77.4 },
  { name: "Northeast Region", lat: 26.1, lng: 91.7 },
];

export const monthlyTrendData = [
  { name: "Jan", cases: 420 },
  { name: "Feb", cases: 380 },
  { name: "Mar", cases: 510 },
  { name: "Apr", cases: 620 },
  { name: "May", cases: 780 },
  { name: "Jun", cases: 950 },
  { name: "Jul", cases: 1200 },
  { name: "Aug", cases: 1100 },
  { name: "Sep", cases: 870 },
  { name: "Oct", cases: 650 },
  { name: "Nov", cases: 480 },
  { name: "Dec", cases: 390 },
];

export const diseaseDistribution = [
  { name: "Influenza", cases: 2340, value: 2340 },
  { name: "Dengue", cases: 1870, value: 1870 },
  { name: "Malaria", cases: 1560, value: 1560 },
  { name: "COVID-19", cases: 980, value: 980 },
  { name: "Cholera", cases: 450, value: 450 },
  { name: "Tuberculosis", cases: 890, value: 890 },
  { name: "Typhoid", cases: 340, value: 340 },
  { name: "Hepatitis", cases: 270, value: 270 },
];

export const heatmapPoints = [
  { lat: 28.6, lng: 77.2, region: "New Delhi", disease: "Influenza", cases: 450, severity: "high" },
  { lat: 19.0, lng: 72.8, region: "Mumbai", disease: "Dengue", cases: 320, severity: "critical" },
  { lat: 13.0, lng: 80.2, region: "Chennai", disease: "Malaria", cases: 180, severity: "medium" },
  { lat: 22.5, lng: 88.3, region: "Kolkata", disease: "Cholera", cases: 95, severity: "medium" },
  { lat: 12.9, lng: 77.5, region: "Bangalore", disease: "COVID-19", cases: 210, severity: "high" },
  { lat: 23.0, lng: 72.5, region: "Ahmedabad", disease: "Typhoid", cases: 150, severity: "medium" },
  { lat: 26.8, lng: 80.9, region: "Lucknow", disease: "Tuberculosis", cases: 280, severity: "high" },
  { lat: 17.3, lng: 78.4, region: "Hyderabad", disease: "Hepatitis", cases: 120, severity: "low" },
  { lat: 21.1, lng: 79.0, region: "Nagpur", disease: "Dengue", cases: 190, severity: "high" },
  { lat: 26.9, lng: 75.7, region: "Jaipur", disease: "Influenza", cases: 340, severity: "high" },
  { lat: 30.7, lng: 76.7, region: "Chandigarh", disease: "COVID-19", cases: 85, severity: "low" },
  { lat: 25.3, lng: 82.9, region: "Varanasi", disease: "Cholera", cases: 220, severity: "critical" },
];

export const weeklyData = [
  { name: "Mon", cases: 145 },
  { name: "Tue", cases: 162 },
  { name: "Wed", cases: 178 },
  { name: "Thu", cases: 193 },
  { name: "Fri", cases: 210 },
  { name: "Sat", cases: 185 },
  { name: "Sun", cases: 156 },
];

export const annualData = [
  { name: "2020", cases: 3200 },
  { name: "2021", cases: 5600 },
  { name: "2022", cases: 4800 },
  { name: "2023", cases: 6200 },
  { name: "2024", cases: 8100 },
  { name: "2025", cases: 9450 },
];

export const sampleHospitals = [
  { name: "City General Hospital", code: "CGH-001", location: "New Delhi", latitude: 28.6, longitude: 77.2, status: "active", total_patients: 1240, region: "North Region", contact_email: "admin@cgh.org" },
  { name: "Metro Health Center", code: "MHC-002", location: "Mumbai", latitude: 19.0, longitude: 72.8, status: "active", total_patients: 980, region: "West Region", contact_email: "admin@mhc.org" },
  { name: "Southern Medical Institute", code: "SMI-003", location: "Chennai", latitude: 13.0, longitude: 80.2, status: "active", total_patients: 760, region: "South Region", contact_email: "admin@smi.org" },
  { name: "Eastern District Hospital", code: "EDH-004", location: "Kolkata", latitude: 22.5, longitude: 88.3, status: "active", total_patients: 540, region: "East Region", contact_email: "admin@edh.org" },
  { name: "Central Care Facility", code: "CCF-005", location: "Bhopal", latitude: 23.2, longitude: 77.4, status: "inactive", total_patients: 320, region: "Central Region", contact_email: "admin@ccf.org" },
];

export const sampleAlerts = [
  { title: "Dengue Outbreak Alert", disease: "dengue", severity: "critical", region: "Mumbai", description: "Significant spike in dengue cases detected across western Mumbai suburbs. Immediate vector control measures recommended.", case_count: 320, status: "active", latitude: 19.0, longitude: 72.8 },
  { title: "Influenza Season Warning", disease: "influenza", severity: "high", region: "New Delhi", description: "Early onset of influenza season detected. Hospital preparedness level elevated.", case_count: 450, status: "active", latitude: 28.6, longitude: 77.2 },
  { title: "Cholera Cluster Identified", disease: "cholera", severity: "critical", region: "Varanasi", description: "Water contamination suspected. Emergency water testing initiated.", case_count: 220, status: "active", latitude: 25.3, longitude: 82.9 },
  { title: "TB Case Surge", disease: "tuberculosis", severity: "high", region: "Lucknow", description: "Increased TB cases in urban slum areas. Active case finding deployed.", case_count: 280, status: "monitoring", latitude: 26.8, longitude: 80.9 },
  { title: "COVID-19 Variant Monitoring", disease: "covid19", severity: "medium", region: "Bangalore", description: "New variant detected in wastewater surveillance. Genomic sequencing underway.", case_count: 210, status: "monitoring", latitude: 12.9, longitude: 77.5 },
];
