import { createEntityService } from './entityServiceFactory.js';

export const dataClient = {
	entities: {
		DiseaseAlert: createEntityService('/disease-alerts'),
		Hospital: createEntityService('/hospitals'),
		ModelUpdate: createEntityService('/model-updates'),
		PatientData: createEntityService('/patient-data'),
		Prediction: createEntityService('/predictions')
	}
};
