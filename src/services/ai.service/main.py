from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
import numpy as np

app = FastAPI()


# ---------- INPUT FORMAT ----------
class AIFeatureInput(BaseModel):
    delta: float
    percent_change: float
    hour: int
    role: int
    record_type: int


# ---------- AI MODEL ----------
model = IsolationForest(
    n_estimators=100,
    contamination=0.15,
    random_state=42
)


# ---------- NORMAL BEHAVIOUR DATA ----------
# Only NORMAL examples here
training_data = np.array([
    [5, 10, 10, 1, 0],
    [3, 6, 11, 1, 0],
    [4, 8, 12, 0, 0],
    [6, 12, 9, 1, 0],
    [2, 4, 14, 1, 0],

    [20, 15, 10, 0, 1],
    [25, 18, 11, 1, 1],

    [1, 100, 2, 0, 2]
])

# train once when server starts
model.fit(training_data)


# ---------- PREDICT ENDPOINT ----------
@app.post("/predict")
def predict_anomaly(data: AIFeatureInput):

    features = np.array([[
        data.delta,
        data.percent_change,
        data.hour,
        data.role,
        data.record_type
    ]])

    prediction = model.predict(features)
    score = model.decision_function(features)

    return {
        "isAnomaly": bool(prediction[0] == -1),
        "score": float(score[0])
    }
