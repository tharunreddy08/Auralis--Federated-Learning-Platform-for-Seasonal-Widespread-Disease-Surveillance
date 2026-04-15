import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
	res.json({
		message: 'Auralis backend is running.',
		apiBase: '/api',
		health: '/api/health'
	});
});

app.get('/api', (_req, res) => {
	res.json({
		message: 'Auralis API base route.',
		availableEndpoints: [
			'/api/health',
			'/api/predict-disease',
			'/api/hospitals',
			'/api/patient-data',
			'/api/disease-alerts',
			'/api/model-updates',
			'/api/predictions'
		]
	});
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
