import json
import os
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

CSV_PATH = "training_data_wbgt.csv"
MODEL_DIR = "./Django-Backend/models"
LOG_PATH = "./Django-Backend/models/stats/"

# two full metros held out entirely -> tests generalization to NEW locations
HOLDOUT_SITES = ["Denver, CO", "Charlotte, NC"]

HORIZONS = [1, 2, 3, 4, 5, 6]
FEATURES = [
    "hour",
    "day_of_year",
    "wet_bulb",
    "apparent_temp",
    "humidity",
    "cloud_cover_octas",
    "ghi",
    "dni",
    "dhi",
    "pct_buildings",
    "pct_roads",
    "pct_greenery",
    "wbgt_now",
]

# force prediction to never DECREASE as these inputs increase -- prevents the
# extrapolation inversion we saw (high current wet_bulb -> lower predicted future wet_bulb)
# order must match FEATURES exactly. 1 = monotonic increasing, 0 = unconstrained
MONOTONE_CONSTRAINTS = (0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0)
#                       hour, doy, wet_bulb, apparent_temp, humidity, ghi, dni, dhi, bldg, road, green

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(LOG_PATH, exist_ok=True)
LOG_PATH += "/training_log.json"


def load_and_split(df):
    # held-out metros -> test set (never seen during train/val at all)
    test_df = df[df["site"].isin(HOLDOUT_SITES)].copy()
    remain_df = df[~df["site"].isin(HOLDOUT_SITES)].copy()

    # chronological split on the remaining sites: earliest dates = train, latest = val
    remain_df = remain_df.sort_values("date")
    split_idx = int(len(remain_df) * 0.8)
    train_df = remain_df.iloc[:split_idx]
    val_df = remain_df.iloc[split_idx:]

    return train_df, val_df, test_df


def train_and_eval(train_df, val_df, test_df):
    results = {}
    for h in HORIZONS:
        target = f"wet_bulb_t+{h}"

        # each horizon has its own valid row set (hours near day-end lack
        # far-future targets) -> drop NaNs per horizon rather than globally
        tr = train_df.dropna(subset=[target])
        va = val_df.dropna(subset=[target])
        te = test_df.dropna(subset=[target])

        X_train, y_train = tr[FEATURES], tr[target]
        X_val, y_val = va[FEATURES], va[target]
        X_test, y_test = te[FEATURES], te[target]

        model = xgb.XGBRegressor(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            monotone_constraints=MONOTONE_CONSTRAINTS,
            random_state=42,
        )
        model.fit(
            X_train,
            y_train,
            eval_set=[(X_val, y_val)],
            verbose=False,
        )

        def metrics(X, y):
            pred = model.predict(X)
            return {
                "mae": float(mean_absolute_error(y, pred)),
                "rmse": float(np.sqrt(mean_squared_error(y, pred))),
                "r2": float(r2_score(y, pred)),
            }

        results[f"t+{h}h"] = {
            "val": metrics(X_val, y_val),
            "test_holdout_metro": metrics(X_test, y_test),
        }

        joblib.dump(model, f"{MODEL_DIR}/wet_bulb_model_t{h}.joblib")
        print(
            f"[t+{h}h] val MAE={results[f't+{h}h']['val']['mae']:.3f}  "
            f"test MAE={results[f't+{h}h']['test_holdout_metro']['mae']:.3f}"
        )

    return results


def run():
    df = pd.read_csv(CSV_PATH)
    train_df, val_df, test_df = load_and_split(df)

    print(
        f"train={len(train_df)} rows, val={len(val_df)} rows, "
        f"test(holdout metros)={len(test_df)} rows (per-horizon usable rows will be slightly higher for t+1..t+5)"
    )

    results = train_and_eval(train_df, val_df, test_df)

    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "holdout_sites": HOLDOUT_SITES,
        "n_train": len(train_df),
        "n_val": len(val_df),
        "n_test": len(test_df),
        "metrics": results,
    }

    logs = []
    if os.path.exists(LOG_PATH):
        with open(LOG_PATH) as f:
            logs = json.load(f)
    logs.append(log_entry)
    with open(LOG_PATH, "w") as f:
        json.dump(logs, f, indent=2)

    print(f"Logged run to {LOG_PATH}")


if __name__ == "__main__":
    run()
