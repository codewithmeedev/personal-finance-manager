from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Email Microservice")

# Pydantic model for email data
class EmailRequest(BaseModel):
    sender_name: str = "FinanceManager"
    sender_email: str
    recipient_email: str
    subject: str
    content: str

@app.post("/send-email")
async def send_email(email_request: EmailRequest):
    api_key = os.getenv("SENDINBLUE_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="SENDINBLUE_API_KEY not set.")
    
    url = "https://api.sendinblue.com/v3/smtp/email"
    data = {
        "sender": {"name": email_request.sender_name, "email": email_request.sender_email},
        "to": [{"email": email_request.recipient_email}],
        "subject": email_request.subject,
        "textContent": email_request.content,
    }
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
    }
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code >= 400:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return {"msg": f"Email sent to {email_request.recipient_email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
