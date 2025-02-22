# integration_test.py

import pytest
from datetime import timedelta
import time
from app.conftest import created_test_emails  # for cleanup


def unique_email(base="inttestuser"):
    return f"{base}_{int(time.time() * 1000)}@example.com"


@pytest.mark.asyncio
async def test_root_endpoint(async_client):
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to the Personal Finance API!"
    }


@pytest.mark.asyncio
async def test_user_signup_and_signin_flow(async_client):
    email = unique_email()
    signup_payload = {
        "username": "integrationuser",
        "email": email,
        "password": "integrationpass"
    }
    signup_response = await async_client.post("/users/signup", json=signup_payload)
    assert signup_response.status_code == 201, signup_response.text
    created_test_emails.append(email)
    signup_data = signup_response.json()
    assert "access_token" in signup_data
    assert "refresh_token" in signup_data

    signin_payload = {
        "email": email,
        "password": "integrationpass"
    }
    signin_response = await async_client.post("/users/signin", json=signin_payload)
    assert signin_response.status_code == 200, signin_response.text
    signin_data = signin_response.json()
    assert "access_token" in signin_data
    assert "refresh_token" in signin_data


@pytest.mark.asyncio
async def test_records_crud_flow(async_client):
    email = unique_email()
    signup_resp = await async_client.post("/users/signup", json={
        "username": "recorduser",
        "email": email,
        "password": "recordpass"
    })
    assert signup_resp.status_code == 201, signup_resp.text
    created_test_emails.append(email)
    tokens = signup_resp.json()
    access_token = tokens["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    record_payload = {
        "amount": 100.0,
        "category": "Groceries",
        "description": "Test grocery shopping",
        "type": "expense"
    }
    create_resp = await async_client.post("/records/", json=record_payload, headers=headers)
    assert create_resp.status_code == 201, create_resp.text
    created_record = create_resp.json()
    record_id = created_record["id"]

    get_resp = await async_client.get("/records/", headers=headers)
    assert get_resp.status_code == 200, get_resp.text
    data = get_resp.json()
    records_list = data.get("records", [])
    assert any(rec["id"] == record_id for rec in records_list)

    update_payload = {"amount": 150.0, "description": "Updated groceries"}
    update_resp = await async_client.patch(f"/records/{record_id}", json=update_payload, headers=headers)
    assert update_resp.status_code == 200, update_resp.text
    updated_record = update_resp.json()
    assert updated_record["amount"] == 150.0
    assert updated_record["description"] == "Updated groceries"

    delete_resp = await async_client.delete(f"/records/{record_id}", headers=headers)
    assert delete_resp.status_code == 200, delete_resp.text
    delete_data = delete_resp.json()
    assert delete_data["message"] == "Record deleted successfully."

    get_after_delete = await async_client.get("/records/", headers=headers)
    assert get_after_delete.status_code == 200, get_after_delete.text
    data_after_delete = get_after_delete.json()
    records_after_delete = data_after_delete.get("records", [])
    assert all(rec["id"] != record_id for rec in records_after_delete)


@pytest.mark.asyncio
async def test_protected_routes_without_auth(async_client):
    response_get = await async_client.get("/records/")
    assert response_get.status_code == 401, response_get.text

    response_post = await async_client.post("/records/", json={"amount": 50.0, "category": "Misc"})
    assert response_post.status_code == 401, response_post.text


def create_expired_token():
    from app.utils import create_token
    data = {"sub": "expireduser"}
    return create_token(data, expires_delta=timedelta(minutes=-1), token_type="access")


@pytest.mark.asyncio
async def test_signin_invalid_credentials(async_client):
    response = await async_client.post("/users/signin", json={
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code in (400, 404), response.text

    email = unique_email("invalidcreds")
    signup_resp = await async_client.post("/users/signup", json={
        "username": "invalidcredsuser",
        "email": email,
        "password": "correctpassword"
    })
    assert signup_resp.status_code == 201, signup_resp.text
    created_test_emails.append(email)

    response = await async_client.post("/users/signin", json={
        "email": email,
        "password": "wrongpassword"
    })
    assert response.status_code == 400, response.text


@pytest.mark.asyncio
async def test_invalid_data_for_record_operations(async_client):
    email = unique_email("invalidrecord")
    signup_resp = await async_client.post("/users/signup", json={
        "username": "invalidrecorduser",
        "email": email,
        "password": "testpassword"
    })
    assert signup_resp.status_code == 201, signup_resp.text
    created_test_emails.append(email)
    signin_resp = await async_client.post("/users/signin", json={
        "email": email,
        "password": "testpassword"
    })
    token = signin_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Missing required "type" and negative amount
    invalid_record_payload = {
        "amount": -50.0,
        "category": "Food",
        "description": "Invalid test"
    }
    create_resp = await async_client.post("/records/", json=invalid_record_payload, headers=headers)
    assert create_resp.status_code in (400, 422), create_resp.text

    update_resp = await async_client.patch("/records/invalid-id", json={"amount": 200.0}, headers=headers)
    assert update_resp.status_code in (400, 404), update_resp.text

    delete_resp = await async_client.delete("/records/invalid-id", headers=headers)
    assert delete_resp.status_code in (400, 404), delete_resp.text


@pytest.mark.asyncio
async def test_expired_or_malformed_tokens(async_client):
    expired_token = create_expired_token()
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = await async_client.get("/records/", headers=headers)
    assert response.status_code == 401, response.text

    malformed_headers = {"Authorization": "Bearer malformed.token.here"}
    response = await async_client.get("/records/", headers=malformed_headers)
    assert response.status_code == 401, response.text


@pytest.mark.asyncio
async def test_pagination_and_filtering(async_client):
    email = unique_email("pagination")
    signup_resp = await async_client.post("/users/signup", json={
        "username": "paginationuser",
        "email": email,
        "password": "testpassword"
    })
    assert signup_resp.status_code == 201, signup_resp.text
    created_test_emails.append(email)
    signin_resp = await async_client.post("/users/signin", json={
        "email": email,
        "password": "testpassword"
    })
    token = signin_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    for i in range(15):
        await async_client.post("/records/", json={
            "amount": 10.0 + i,
            "category": "TestCategory",
            "description": f"Record {i}",
            "type": "expense"
        }, headers=headers)

    response = await async_client.get("/records/?skip=0&limit=5", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    records = data.get("records", [])
    assert len(records) <= 5

    response = await async_client.get("/records/?category=testcategory", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    records = data.get("records", [])
    for record in records:
        assert "testcategory" in record["category"].lower()


@pytest.mark.asyncio
async def test_unauthorized_access(async_client):
    response = await async_client.get("/records/")
    assert response.status_code == 401, response.text

    response = await async_client.post("/records/", json={"amount": 50.0, "category": "Misc"})
    assert response.status_code == 401, response.text


@pytest.mark.asyncio
async def test_non_existent_resource_operations(async_client):
    email = unique_email("nonexistent")
    signup_resp = await async_client.post("/users/signup", json={
        "username": "nonexistentuser",
        "email": email,
        "password": "testpassword"
    })
    assert signup_resp.status_code == 201, signup_resp.text
    created_test_emails.append(email)
    signin_resp = await async_client.post("/users/signin", json={
        "email": email,
        "password": "testpassword"
    })
    token = signin_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await async_client.patch("/records/507f1f77bcf86cd799439099", json={"amount": 200.0}, headers=headers)
    assert response.status_code == 404, response.text

    response = await async_client.delete("/records/507f1f77bcf86cd799439099", headers=headers)
    assert response.status_code == 404, response.text
