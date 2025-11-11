import os
from app.database import SessionLocal
from app.models.models import Prediction

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "app", "uploads")

db = SessionLocal()
predictions = db.query(Prediction).all()

updated = 0
missing = 0

for p in predictions:
    old_path = p.image_path or ""
    filename = os.path.basename(old_path)

    if not filename:
        continue

    abs_path = os.path.join(UPLOAD_DIR, filename)

    if os.path.exists(abs_path):
        # ✅ File exists — update to relative path
        new_path = f"uploads/{filename}"
        if p.image_path != new_path:
            p.image_path = new_path
            updated += 1
    else:
        # ❌ File missing — log it
        print(f"Missing file for prediction_id={p.prediction_id}: {abs_path}")
        missing += 1

db.commit()
db.close()

print(f"✅ Updated {updated} records. ❌ Missing {missing} files.")
