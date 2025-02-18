# app/routers/contact.py
from fastapi import APIRouter, HTTPException, BackgroundTasks, Body
from app.schemas import ContactRequest
from dotenv import load_dotenv
import os
import requests

load_dotenv()

router = APIRouter(
    prefix="/contact",
    tags=["Contact"]
)

def send_contact_email_sendinblue(recipient: str, subject: str, content: str):
    api_key = os.getenv("SENDINBLUE_API_KEY")
    sender_email = os.getenv("SENDER_EMAIL")
    url = "https://api.sendinblue.com/v3/smtp/email"
    data = {
        "sender": {"name": "FinanceManager", "email": sender_email},
        "to": [{"email": recipient}],
        "subject": subject,
        "textContent": content,
    }
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
    }
    response = requests.post(url, json=data, headers=headers)
    if response.status_code >= 400:
        raise Exception(f"Sendinblue error: {response.text}")
    return response

@router.post("/", status_code=200)
async def contact_us(
    contact: ContactRequest,
    background_tasks: BackgroundTasks
):
    """
    Accept a contact message from the user and send it to the designated recipient.
    """
    recipient = os.getenv("CONTACT_RECIPIENT_EMAIL")
    subject = f"New Contact Message from {contact.name}"
    content = (
        f"Name: {contact.name}\n"
        f"Email: {contact.email}\n\n"
        f"Message:\n{contact.message}"
    )
    try:
        background_tasks.add_task(send_contact_email_sendinblue, recipient, subject, content)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send message.")
    return {"msg": "Your message has been sent. We'll get back to you soon."}
