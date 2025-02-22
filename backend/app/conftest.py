# conftest.py

import asyncio
import pytest
import warnings
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import users_collection, records_collection

created_test_emails = []


@pytest.fixture(scope="session")
def event_loop():
    # Create a new event loop for the session to avoid "Event loop is closed" errors.
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def anyio_backend():
    return 'asyncio'


@pytest_asyncio.fixture(scope="function")
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(base_url="http://testserver", transport=transport) as client:
        yield client


@pytest.fixture(autouse=True)
def ignore_warnings():
    warnings.filterwarnings("ignore")


@pytest.fixture(scope="session", autouse=True)
async def cleanup_test_data():
    # Run all tests first
    yield
    # After tests complete, delete each test user and their records
    for email in created_test_emails:
        user = await users_collection.find_one({"email": email})
        if user:
            await users_collection.delete_one({"_id": user["_id"]})
            await records_collection.delete_many({"user_id": str(user["_id"])})
