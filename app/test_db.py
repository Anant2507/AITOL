from urllib.parse import quote_plus
from sqlalchemy import create_engine

# Put your REAL password inside the quotes
password = quote_plus("Anant@2507")

DATABASE_URL = f"postgresql://postgres:{password}@localhost:5432/aitol"

try:
    engine = create_engine(DATABASE_URL)
    connection = engine.connect()
    print("✅ Database Connected Successfully!")
    connection.close()
except Exception as e:
    print("Error:", e)