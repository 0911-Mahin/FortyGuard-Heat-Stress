# Outdoor Worker Heat-Stress Risk Advisor

Know exactly when it's safe to work, so your workers are not at risk



https://github.com/user-attachments/assets/aeec139c-b7ff-4ce8-af81-0f71584725d7


Demo also available on [youtube](https://youtu.be/3XXnFm0tLxE)

## Problem
Workplace heat stress causes physiological heat strain in the body that can lead to exhaustion, pathological conditions and death. More than 2.4 billion workers are exposed to excessive heat globally, resulting in more than 22.85 million occupational injuries each year. More than one third of all persons who frequently work in hot conditions experience physiological heat strain. A systematic review and meta-analysis estimated that 35% of individuals who frequently work under workplace heat stress experience heat-related illnesses, including heat exhaustion and heat stroke.  
  
(WHO, Workplace heat stress - 2025)
## Solution
A web app that predicts Outdoor Worker Heat-Stress Risk for a given area, and translates that into decisions like "Safe to work", "Mandatory 15-min breaks every hour" or "Stop outdoor work", so organizers can plan their working shifts accordingly
## Features
- Get analysis of exact location based on latitude and longitude
- +0 to +6 hours wet-bulb temperature predictions, so shift durations can be planned effectively
- Greenery simulation, re-inference on vegetation change
    - Greenery is calculated based on old satellite images
    - Hence, changes in greenery since then can be simulated
    - Simulation results are cached in the database, avoiding redundant re-inference for repeated queries
- Monitor multiple sites in a single place
- WBGT risk classification used for decision making

## Tech Stack
- Frontend:
    - React 19 (Vite Build Tool)
    - Tailwind CSS 3
    - Leaflet + React-Leaflet 5
    - Lucide React
- Backend:
    - Django REST Framework
    - Threading
    - SQLite
- ML:
    - XGBoost - XGBRegressors
- APIs:
    - FortyGuard's Weather API
        - Environmental Parameters
        - Satellite Segmentation API

## Architecture
Location -> Backend (async job) -> FortyGuard APIs -> Feature extraction -> 6× XGBoost models -> Frontend (polling) -> WBGT risk classification  

The user selects a location (latitude, longitude), the coordinates are sent to the backend. There, a separate thread is started to collect live data from FortyGuard's API. The collected data is organized and passed into 6 different XGBoost regressor models to predict wet bulb temperature and stored in the database, which can then be fetched by the frontend by the method of polling. The predicted wet bulb temperature is then classified into different risk levels.

## Data & Model
- XGBRegressor model x6
- Model performance

  | Metric | Best | Worst |
  | --- | --- | --- |
  | MAE | 0.71 | 1.68 |
  | RMSE | 1.20 | 2.32|
  | R² | 0.97 | 0.91 |

- Trained on a dataset of 18068 observations
- Chronological split of 80/20 between train and validation, Denver + Charlotte held out for testing

## Setup Locally
1. Clone repository (or download zip directly from github and extract)
   ```bash
   git clone https://github.com/0911-Mahin/FortyGuard-Heat-Stress
   ```
2. Navigate to project folder
   ```bash
   cd FortyGuard-Heat-Stress
   ```
3. Install frontend modules
   ```bash
   cd React-Frontend
   npm install
   ```
4. Setup backend
   ```bash
    cd ../Django-Backend
    python -m venv env
    source ./env/bin/activate
    pip install -r requirements.txt
    ```
5. Add FG_API_KEY to environment variables (FortyGuard API key)  
Add `.env` file inside folder `Django-Backend/Backend` and place the API key in the following format  
    ```env
    FG_API_KEY=your-forty-guard-api-key
    ```
6. Start Server
   ```bash
   python manage.py runserver
   # In another terminal inside React-Frontend folder
   npm run dev
   ```
7. Open the link mentioned in the running react server (http://localhost:5173)
> [!NOTE]
> Files including Data collection script, conversion of raw data into CSV, Model training etc are not uploaded but are available if needed
