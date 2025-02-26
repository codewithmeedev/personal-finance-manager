import os
import requests
from fastapi import APIRouter, HTTPException, BackgroundTasks, Body
from app.schemas import ContactRequest
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/contact", tags=["Contact"])


def send_contact_email_via_service(recipient: str, subject: str, content: str):
    email_service_url = os.getenv(
        "EMAIL_SERVICE_URL", "http://email_microservice:9002").strip()
    sender_email = os.getenv("SENDER_EMAIL", "default@example.com")
    payload = {
        "sender_name": "FinanceManager",
        "sender_email": sender_email,
        "recipient_email": recipient,
        "subject": subject,
        "content": content,
    }
    try:
        response = requests.post(
            f"{email_service_url}/send-email", json=payload)
        response.raise_for_status()
        print(f"Email sent: {response.json()}")
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message.")


@router.post("/", status_code=200)
async def contact_us(contact: ContactRequest, background_tasks: BackgroundTasks):
    recipient = os.getenv("CONTACT_RECIPIENT_EMAIL")
    subject = f"New Contact Message from {contact.name}"
    content = f"Name: {contact.name}\nEmail: {contact.email}\n\nMessage:\n{contact.message}"
    background_tasks.add_task(
        send_contact_email_via_service, recipient, subject, content)
    return {"msg": "Your message has been sent. We'll get back to you soon."}
