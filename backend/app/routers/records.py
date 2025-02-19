# app/routers/records.py

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone
from zoneinfo import ZoneInfo


from app.schemas import RecordCreate, RecordRead, RecordUpdate
from app.database import records_collection
from app.serializers import serialize_record
from app.auth import get_current_user

router = APIRouter(
    prefix="/records",
    tags=["Records"]
)


@router.post("/", response_model=RecordRead, status_code=201)
async def create_record(record: RecordCreate, current_user: dict = Depends(get_current_user)):
    """
    Create a new record for the authenticated user.
    """
    user_id = str(current_user["_id"])

    record_dict = record.model_dump()
    record_dict["user_id"] = user_id
    record_dict["date"] = datetime.now(timezone.utc)

    try:
        result = await records_collection.insert_one(record_dict)
        inserted_record = await records_collection.find_one({"_id": result.inserted_id})
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Internal server error."
        )

    return serialize_record(inserted_record)


@router.get("/", status_code=200)
async def get_records(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        10, ge=1, le=100, description="Maximum number of records to return"),
    category: Optional[str] = Query(
        None, description="Filter records by category keyword"),
    sortField: Optional[str] = Query("date", description="Field to sort by"),
    sortOrder: Optional[int] = Query(
        -1, description="Sort order: 1 for ascending, -1 for descending"),
    all: bool = Query(
        False, description="If true, return all records without pagination")
):
    user_id = str(current_user["_id"])
    query_filter = {"user_id": user_id}
    if category:
        query_filter["category"] = {"$regex": category, "$options": "i"}

    if all:
        records = []
        async for record in records_collection.find(query_filter).sort(sortField, sortOrder):
            records.append(serialize_record(record))
        total = len(records)
    else:
        total = await records_collection.count_documents(query_filter)
        records = []
        async for record in records_collection.find(query_filter).sort(sortField, sortOrder).skip(skip).limit(limit):
            records.append(serialize_record(record))

    return {"records": records, "total": total}


@router.patch("/{record_id}", response_model=RecordRead, status_code=200)
async def update_record(record_id: str, updated_record: RecordUpdate, current_user: dict = Depends(get_current_user)):
    """
    Partially update a record for the authenticated user.
    """
    user_id = str(current_user["_id"])

    if not ObjectId.is_valid(record_id):
        raise HTTPException(
            status_code=400, detail="Invalid record ID format.")

    record = await records_collection.find_one({"_id": ObjectId(record_id), "user_id": user_id})
    if not record:
        raise HTTPException(
            status_code=404, detail="Record not found."
        )

    update_data = updated_record.model_dump(exclude_unset=True)
    if update_data:
        try:
            await records_collection.update_one(
                {"_id": ObjectId(record_id)},
                {"$set": update_data}
            )
            record = await records_collection.find_one({"_id": ObjectId(record_id)})
        except Exception:
            raise HTTPException(
                status_code=500, detail="Internal server error.")

    return serialize_record(record)


@router.delete("/{record_id}", status_code=200)
async def delete_record(record_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a record for the authenticated user.
    """
    user_id = str(current_user["_id"])

    if not ObjectId.is_valid(record_id):
        raise HTTPException(
            status_code=400, detail="Invalid record ID format.")

    try:
        result = await records_collection.delete_one(
            {"_id": ObjectId(record_id), "user_id": user_id}
        )
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404, detail="Record not found."
            )
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error.")

    return {"message": "Record deleted successfully."}
