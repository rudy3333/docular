from fastapi import FastAPI, Request, UploadFile, File
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from pyairtable import Api
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
import tempfile
import base64

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key")  # Use env var in production
ALGORITHM = "HS256"

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=1)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

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
        # Issue JWT
        token = create_access_token({"sub": user.email})
        return {"success": True, "token": token}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/upload_pdf")
def upload_pdf(file: UploadFile = File(...), payload: dict = Depends(verify_token)):
    base_id = os.getenv("AIRTABLE_BASE_ID")
    api_key = os.getenv("AIRTABLE_API_KEY")
    table_name = "pdfs"
    if not base_id or not api_key:
        return {"success": False, "error": "Missing AIRTABLE_BASE_ID or AIRTABLE_API_KEY in environment."}
    try:
        api = Api(api_key)
        table = api.table(base_id, table_name)
        user_email = payload["sub"]
        record = table.create({
            "filename": file.filename,
            "uploaded_at": datetime.utcnow().isoformat(),
            "user_email": user_email
        })
        record_id = record['id']
        file_bytes = file.file.read()
        file_b64 = base64.b64encode(file_bytes).decode('utf-8')
        upload_url = f"https://content.airtable.com/v0/{base_id}/{record_id}/attachments/uploadAttachment"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "contentType": file.content_type,
            "file": file_b64,
            "filename": file.filename
        }
        upload_res = requests.post(upload_url, headers=headers, json=data)
        if not upload_res.ok:
            return {"success": False, "error": f"Airtable uploadAttachment failed: {upload_res.text}"}
        return {"success": True, "pdf_id": record_id, "filename": file.filename}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/delete_pdf/{pdf_id}")
def delete_pdf(pdf_id: str, payload: dict = Depends(verify_token)):
    base_id = os.getenv("AIRTABLE_BASE_ID")
    api_key = os.getenv("AIRTABLE_API_KEY")
    table_name = "pdfs"
    if not base_id or not api_key:
        return {"success": False, "error": "Missing AIRTABLE_BASE_ID, AIRTABLE_API_KEY in environment."}
    try:
        api = Api(api_key)
        table = api.table(base_id, table_name)
        table.delete(pdf_id)
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

@app.get("/list_pdfs")
def list_pdfs(payload: dict = Depends(verify_token)):
    base_id = os.getenv("AIRTABLE_BASE_ID")
    api_key = os.getenv("AIRTABLE_API_KEY")
    table_name = "pdfs"
    if not base_id or not api_key:
        return {"success": False, "error": "Missing AIRTABLE_BASE_ID, AIRTABLE_API_KEY in environment."}
    try:
        api = Api(api_key)
        table = api.table(base_id, table_name)
        user_email = payload["sub"]
        formula = f"{{user_email}} = '{user_email}'"
        records = table.all(formula=formula)
        pdfs = []
        for rec in records:
            fields = rec.get('fields', {})
            pdfs.append({
                "pdf_id": rec["id"],
                "filename": fields.get("filename"),
                "uploaded_at": fields.get("uploaded_at"),
                "attachments": fields.get("attachments", []),
                "summary": fields.get("summary")
            })
        return {"success": True, "pdfs": pdfs}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/pdf_summary/{pdf_id}")
def get_pdf_summary(pdf_id: str, payload: dict = Depends(verify_token)):
    base_id = os.getenv("AIRTABLE_BASE_ID")
    api_key = os.getenv("AIRTABLE_API_KEY")
    table_name = "pdfs"
    if not base_id or not api_key:
        return {"success": False, "error": "Missing AIRTABLE_BASE_ID, AIRTABLE_API_KEY in environment."}
    try:
        api = Api(api_key)
        table = api.table(base_id, table_name)
        record = table.get(pdf_id)
        fields = record.get('fields', {})
        summary = fields.get("summary")
        return {"success": True, "summary": summary}
    except Exception as e:
        return {"success": False, "error": str(e)}