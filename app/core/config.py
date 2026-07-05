from urllib.parse import quote_plus
from dotenv import load_dotenv
import os

load_dotenv()

password = quote_plus(os.getenv("DB_PASSWORD"))

DATABASE_URL = (
    f"postgresql://{os.getenv('DB_USER')}:"
    f"{password}@"
    f"{os.getenv('DB_HOST')}:"
    f"{os.getenv('DB_PORT')}/"
    f"{os.getenv('DB_NAME')}"
)