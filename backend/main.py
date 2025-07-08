from fastapi import FastAPI
import os
from dotenv import load_dotenv
from pyairtable import Api

load_dotenv()

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Docular FastAPI backend!"}

@app.get("/airtable")
def airtable_test():
    base_id = os.getenv("AIRTABLE_BASE_ID")
    api_key = os.getenv("AIRTABLE_API_KEY")
    table_name = "users"
    if not base_id or not api_key:
        return {"success": False, "error": "Missing AIRTABLE_BASE_ID, AIRTABLE_API_KEY in environment."}
    try:
        api = Api(api_key)
        table = api.table(base_id, table_name)
        records = table.all(max_records=1)
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}