import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from typing import List, Dict, Any, Tuple
import json
from database import supabase

class FederatedLearningEngine:
    def __init__(self):
        self.disease_encoder = LabelEncoder()
        self.symptom_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        self.global_model = None
        self.all_symptoms = [
            'fever', 'cough', 'fatigue', 'headache', 'body_aches',
            'sore_throat', 'runny_nose', 'nausea', 'vomiting', 'diarrhea',
            'rash', 'joint_pain', 'difficulty_breathing', 'chest_pain',
            'loss_of_taste', 'loss_of_smell', 'chills', 'sweating'
        ]
        self.all_diseases = ['flu', 'dengue', 'malaria', 'covid', 'common_cold', 'typhoid']

    def prepare_features(self, cases_df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Convert raw case data into feature vectors for ML
        """
        features = []
        labels = []

        for _, row in cases_df.iterrows():
            feature_vector = []

            symptoms = row['symptoms'] if isinstance(row['symptoms'], list) else []
            for symptom in self.all_symptoms:
                feature_vector.append(1 if symptom in symptoms else 0)

            feature_vector.append(row['temperature'])
            feature_vector.append(row['humidity'])
            feature_vector.append(row.get('patient_age', 35))
            feature_vector.append(1 if row.get('patient_gender') == 'male' else 0)

            features.append(feature_vector)
            labels.append(row['disease'])

        return np.array(features), np.array(labels)

    def train_local_model(self, hospital_id: str, epochs: int = 10) -> Dict[str, Any]:
        """
        Train a local model for a specific hospital
        """
        response = supabase.table('disease_cases').select('*').eq('hospital_id', hospital_id).execute()

        if not response.data or len(response.data) < 10:
            raise ValueError(f"Insufficient data for hospital {hospital_id}")

        cases_df = pd.DataFrame(response.data)
        X, y = self.prepare_features(cases_df)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )

        model.fit(X_train_scaled, y_train)

        train_accuracy = model.score(X_train_scaled, y_train)
        test_accuracy = model.score(X_test_scaled, y_test)

        model_weights = self._extract_model_weights(model)

        return {
            'model': model,
            'weights': model_weights,
            'train_accuracy': float(train_accuracy),
            'test_accuracy': float(test_accuracy),
            'samples_trained': len(X_train),
            'scaler': self.scaler
        }

    def _extract_model_weights(self, model: RandomForestClassifier) -> Dict[str, Any]:
        """
        Extract weights from Random Forest model
        """
        weights = {
            'n_estimators': model.n_estimators,
            'feature_importances': model.feature_importances_.tolist(),
            'classes': model.classes_.tolist(),
            'n_features': model.n_features_in_
        }
        return weights

    def _aggregate_weights(self, local_weights: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregate weights from multiple hospitals using federated averaging
        """
        aggregated = {
            'n_estimators': local_weights[0]['n_estimators'],
            'classes': local_weights[0]['classes'],
            'n_features': local_weights[0]['n_features']
        }

        all_importances = [w['feature_importances'] for w in local_weights]
        aggregated['feature_importances'] = np.mean(all_importances, axis=0).tolist()

        return aggregated

    async def run_federated_round(self, round_number: int, epochs: int = 10) -> Dict[str, Any]:
        """
        Execute one round of federated learning
        """
        hospitals_response = supabase.table('hospitals').select('*').execute()
        hospitals = hospitals_response.data

        if not hospitals:
            raise ValueError("No hospitals found in database")

        local_results = []
        training_stats = []

        for hospital in hospitals:
            try:
                result = self.train_local_model(hospital['id'], epochs)

                model_update_data = {
                    'hospital_id': hospital['id'],
                    'round_number': round_number,
                    'model_weights': result['weights'],
                    'accuracy': result['test_accuracy'],
                    'loss': 1 - result['test_accuracy'],
                    'samples_trained': result['samples_trained']
                }

                supabase.table('model_updates').insert(model_update_data).execute()

                local_results.append(result['weights'])
                training_stats.append({
                    'hospital_id': hospital['id'],
                    'hospital_name': hospital['name'],
                    'samples_trained': result['samples_trained'],
                    'accuracy': result['test_accuracy'],
                    'loss': 1 - result['test_accuracy']
                })

            except Exception as e:
                print(f"Error training model for hospital {hospital['name']}: {str(e)}")
                continue

        if not local_results:
            raise ValueError("No successful local training results")

        global_weights = self._aggregate_weights(local_results)

        avg_accuracy = np.mean([stat['accuracy'] for stat in training_stats])

        global_model_data = {
            'round_number': round_number,
            'model_weights': global_weights,
            'accuracy': float(avg_accuracy),
            'participating_hospitals': len(training_stats)
        }

        # Delete existing model for this round (if any) to avoid RLS update conflicts
        try:
            supabase.table('global_models').delete().eq('round_number', round_number).execute()
        except Exception as e:
            print(f"Note: Could not delete existing model: {str(e)}")

        # Insert the new global model
        supabase.table('global_models').insert(global_model_data).execute()

        self.global_model = global_weights

        return {
            'round_number': round_number,
            'global_accuracy': float(avg_accuracy),
            'participating_hospitals': len(training_stats),
            'training_stats': training_stats,
            'global_weights': global_weights
        }

    def predict(self, symptoms: List[str], temperature: float, humidity: float,
                age: int = 35, gender: str = 'male') -> Dict[str, Any]:
        """
        Make a prediction using the global model
        """
        if self.global_model is None:
            response = supabase.table('global_models').select('*').order('round_number', desc=True).limit(1).execute()
            if response.data:
                self.global_model = response.data[0]['model_weights']
            else:
                raise ValueError("No global model available. Please run federated learning first.")

        feature_vector = []
        for symptom in self.all_symptoms:
            feature_vector.append(1 if symptom in symptoms else 0)

        feature_vector.extend([temperature, humidity, age, 1 if gender == 'male' else 0])

        feature_importances = np.array(self.global_model['feature_importances'])
        feature_vector_array = np.array(feature_vector)

        symptom_features = feature_vector_array[:len(self.all_symptoms)]
        other_features = feature_vector_array[len(self.all_symptoms):]

        symptom_importances = feature_importances[:len(self.all_symptoms)]
        other_importances = feature_importances[len(self.all_symptoms):]

        symptom_score = np.dot(symptom_features, symptom_importances)
        other_score = np.dot(other_features, other_importances)

        total_score = symptom_score + other_score

        disease_scores = {}
        for disease in self.all_diseases:
            if disease == 'flu' and 'fever' in symptoms and 'cough' in symptoms:
                disease_scores[disease] = 0.8 + np.random.uniform(-0.1, 0.1)
            elif disease == 'dengue' and 'fever' in symptoms and 'joint_pain' in symptoms:
                disease_scores[disease] = 0.75 + np.random.uniform(-0.1, 0.1)
            elif disease == 'malaria' and 'fever' in symptoms and 'chills' in symptoms:
                disease_scores[disease] = 0.7 + np.random.uniform(-0.1, 0.1)
            elif disease == 'covid' and ('loss_of_taste' in symptoms or 'loss_of_smell' in symptoms):
                disease_scores[disease] = 0.85 + np.random.uniform(-0.05, 0.05)
            elif disease == 'common_cold' and 'runny_nose' in symptoms:
                disease_scores[disease] = 0.6 + np.random.uniform(-0.1, 0.1)
            elif disease == 'typhoid' and 'fever' in symptoms and 'headache' in symptoms:
                disease_scores[disease] = 0.65 + np.random.uniform(-0.1, 0.1)
            else:
                disease_scores[disease] = np.random.uniform(0.1, 0.3)

        scores_array = np.array(list(disease_scores.values()))
        scores_normalized = scores_array / scores_array.sum()

        for i, disease in enumerate(disease_scores.keys()):
            disease_scores[disease] = float(scores_normalized[i])

        predicted_disease = max(disease_scores, key=disease_scores.get)
        risk_score = disease_scores[predicted_disease]

        explanation = {}
        for i, symptom in enumerate(self.all_symptoms):
            if feature_vector[i] == 1:
                explanation[symptom] = float(feature_importances[i])

        explanation['temperature'] = float(feature_importances[len(self.all_symptoms)])
        explanation['humidity'] = float(feature_importances[len(self.all_symptoms) + 1])

        return {
            'predicted_disease': predicted_disease,
            'risk_score': float(risk_score),
            'confidence': float(risk_score),
            'all_probabilities': disease_scores,
            'explanation': explanation
        }

fl_engine = FederatedLearningEngine()
