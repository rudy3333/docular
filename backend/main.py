from fastapi import FastAPI, Request
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from pyairtable import Api
import bcrypt

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

@app.post("/signup")
def signup(user: SignUpRequest):
    base_id = os.getenv("AIRTABLE_BASE_ID")
    api_key = os.getenv("AIRTABLE_API_KEY")
    table_name = "users"
    if not base_id or not api_key:
        return {"success": False, "error": "Missing AIRTABLE_BASE_ID, AIRTABLE_API_KEY in environment."}
    try:
        api = Api(api_key)
        table = api.table(base_id, table_name)
        formula = f"{{email}} = '{user.email}'"
        existing = table.all(formula=formula, max_records=1)
        if existing:
            return {"success": False, "error": "Email already registered."}
        hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        table.create({
            "name": user.name,
            "email": user.email,
            "password": hashed_pw.decode('utf-8')
        })
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@app.post("/login")
def login(user: LoginRequest):
    base_id = os.getenv("AIRTABLE_BASE_ID")
    api_key = os.getenv("AIRTABLE_API_KEY")
    table_name = "users"
    if not base_id or not api_key:
        return {"success": False, "error": "Missing AIRTABLE_BASE_ID, AIRTABLE_API_KEY in environment."}
    try:
        api = Api(api_key)
        table = api.table(base_id, table_name)
        formula = f"{{email}} = '{user.email}'"
        records = table.all(formula=formula, max_records=1)
        if not records:
            return {"success": False, "error": "Invalid email or password."}
        user_record = records[0]['fields']
        hashed_pw = user_record.get("password")
        if not hashed_pw or not bcrypt.checkpw(user.password.encode('utf-8'), hashed_pw.encode('utf-8')):
            return {"success": False, "error": "Invalid email or password."}
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

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