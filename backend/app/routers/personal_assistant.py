from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.database import records_collection
from app.schemas import QuestionRequest
import os
import requests

router = APIRouter(
    prefix="/personal_assistant",
    tags=["Personal Assistant"]
)


@router.post("/")
async def personal_assistant(
    request: QuestionRequest,
    current_user: dict = Depends(get_current_user)
):
    question = request.question
    user_id = str(current_user["_id"])
    username = current_user.get("username", "User")

    one_month_ago = datetime.now(timezone.utc) - timedelta(days=30)
    records_cursor = records_collection.find({
        "user_id": user_id,
        "date": {"$gte": one_month_ago}
    })
    records = await records_cursor.to_list(length=100)
    records_summary = "\n".join([
        f"{record['date'].strftime('%Y-%m-%d')}: Spent ${record['amount']} on {record.get('category', 'various')}."
        for record in records
    ])

    system_message = (
        f"You are a highly knowledgeable personal finance assistant. The user, {username}, has the following recent transaction history:\n"
        f"{records_summary}\n\n"
        "Provide personalized financial advice, budgeting tips, and recommendations. Limit the response to 100 words."
    )

    llm_service_url = os.getenv("LLM_SERVICE_URL", "default_value").strip()
    payload = {"prompt": f"{system_message}\nUser question: {question}"}

    try:
        llm_response = requests.post(
            f"{llm_service_url}/generate", json=payload)
        llm_response.raise_for_status()
        data = llm_response.json()
        ai_response = data.get("response", "No response from AI.")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calling LLM microservice: {str(e)}")

    return {"response": ai_response}
