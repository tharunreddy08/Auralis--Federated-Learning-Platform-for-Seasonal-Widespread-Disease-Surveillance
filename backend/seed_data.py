"""
Seed data for demo mode - no database operations needed
"""

def seed_all_data():
    """
    Seed demo data - no-op in local demo mode
    """
    print("INFO: Running in local demo mode - no database seeding required.")
    print("Demo data is generated in-memory by local_fallback.py")
    return True

    all_symptoms = list(set([s for symptoms in SYMPTOMS_MAPPING.values() for s in symptoms]))

    cases_per_hospital = 150

    for hospital_id in hospital_ids:
        cases = []

        for _ in range(cases_per_hospital):
            disease = random.choice(list(SYMPTOMS_MAPPING.keys()))

            primary_symptoms = SYMPTOMS_MAPPING[disease]
            num_symptoms = random.randint(3, min(6, len(primary_symptoms)))
            selected_symptoms = random.sample(primary_symptoms, num_symptoms)

            if random.random() < 0.2:
                extra_symptoms = [s for s in all_symptoms if s not in selected_symptoms]
                if extra_symptoms:
                    selected_symptoms.append(random.choice(extra_symptoms))

            if disease in ['flu', 'dengue', 'malaria', 'covid', 'typhoid']:
                temperature = random.uniform(38.0, 40.5)
            else:
                temperature = random.uniform(36.5, 38.5)

            humidity = random.uniform(40, 90)

            random_days = random.randint(0, 90)
            case_date = start_date + timedelta(days=random_days)

            age = random.randint(5, 85)
            gender = random.choice(['male', 'female'])

            case_data = {
                'hospital_id': hospital_id,
                'disease': disease,
                'symptoms': selected_symptoms,
                'temperature': round(temperature, 1),
                'humidity': round(humidity, 1),
                'date': case_date.isoformat(),
                'patient_age': age,
                'patient_gender': gender
            }

            cases.append(case_data)

        supabase.table('disease_cases').insert(cases).execute()
        print(f"Created {len(cases)} cases for hospital {hospital_id}")

    print(f"Total cases generated: {cases_per_hospital * len(hospital_ids)}")

def generate_historical_alerts(hospital_ids):
    """Generate some historical alerts"""
    print("Generating alerts...")

    end_date = datetime.now().date()
    diseases = list(SYMPTOMS_MAPPING.keys())

    for i in range(10):
        alert_date = end_date - timedelta(days=random.randint(1, 60))
        disease = random.choice(diseases)
        case_count = random.randint(15, 50)
        threshold = 20

        severity = 'low'
        if case_count > 40:
            severity = 'critical'
        elif case_count > 30:
            severity = 'high'
        elif case_count > 25:
            severity = 'medium'

        status = 'resolved' if random.random() < 0.6 else 'active'

        hospital_id = random.choice(hospital_ids) if random.random() < 0.7 else None

        hospital_response = supabase.table('hospitals').select('location').eq('id', hospital_id).execute() if hospital_id else None
        location = hospital_response.data[0]['location'] if hospital_response and hospital_response.data else random.choice(['New York', 'California', 'Texas'])

        alert_data = {
            'hospital_id': hospital_id,
            'location': location,
            'disease': disease,
            'case_count': case_count,
            'threshold': threshold,
            'severity': severity,
            'status': status,
            'alert_date': alert_date.isoformat()
        }

        supabase.table('alerts').insert(alert_data).execute()

    print("Alerts generated successfully")

def seed_all_data():
    """Main function to seed all data"""
    if supabase is None:
        print("\n⚠️ Seed skipped: Supabase is not configured.")
        return False
    try:
        clear_existing_data()
        hospital_ids = seed_hospitals()
        generate_disease_cases(hospital_ids)
        generate_historical_alerts(hospital_ids)
        print("\n✅ Data seeding completed successfully!")
        return True
    except Exception as e:
        print(f"\n❌ Error seeding data: {str(e)}")
        return False

if __name__ == "__main__":
    seed_all_data()

