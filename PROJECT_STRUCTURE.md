# Auralis Project Structure

Updated structure after cleanup (Node backend + React frontend).

## Root

```text
Auralis/
	package.json                # frontend run/build scripts (from root)
	README.md
	PROJECT_STRUCTURE.md
	.gitignore
	data/
		patient-data-sample.csv   # CSV sample for hospital upload
	backend/
	frontend/
```

## Backend

```text
backend/
	.env.example
	package.json
	package-lock.json
	README.md
	SETUP.md
	server.js                   # imports src/server.js
	src/
		app.js
		server.js
		config/
			db.js
		constants/
			enums.js
		data/
			seedData.js
			seedIfEmpty.js
		middleware/
			errorHandler.js
		models/
			DiseaseAlert.js
			Hospital.js
			ModelUpdate.js
			PatientData.js
			Prediction.js
			index.js
		routes/
			createCrudRouter.js
			index.js
		scripts/
			seed.js
```

## Frontend

```text
frontend/
	.env.example
	.env.local
	index.html
	vite.config.js
	tailwind.config.js
	postcss.config.js
	eslint.config.js
	components.json
	jsconfig.json
	src/
		App.jsx
		main.jsx
		index.css
		api/
		components/
			dashboard/
			ui/
		hooks/
		lib/
		pages/
			admin/
			hospital/
			official/
		utils/
```

## Run Commands

- Frontend: `npm run dev`
- Backend: `cd backend && npm run dev`
- Seed backend data: `cd backend && npm run seed`
