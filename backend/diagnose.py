# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
import os
import sys
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore"

def check(step):
    print(f"[CHECKPOINT] {step}...")

check("Start")
print(f"Python: {sys.version}")

try:
    check("Importing numpy")
    import numpy # type: ignore
    print(f"NumPy Version: {numpy.__version__}")
except Exception as e:
    print(f"❌ NumPy failed: {e}")

try:
    check("Importing motor")
    import motor # type: ignore
    import pymongo # type: ignore
    print(f"Motor Version: {motor.version}")
    print(f"PyMongo Version: {pymongo.version}")
except Exception as e:
    print(f"❌ Motor/PyMongo failed: {e}")

try:
    check("Importing faiss")
    import faiss # type: ignore
    print("✅ FAISS success")
except Exception as e:
    print(f"❌ FAISS failed: {e}")

try:
    check("Importing app.main")
    # This will trigger database connections etc if not careful
    from app.main import app # type: ignore
    print("✅ Project import success")
except Exception as e:
    print(f"❌ Project failed: {e}")
    import traceback
    traceback.print_exc()

check("End")
