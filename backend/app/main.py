# main.py
from app.routers import users, records, personal_assistant, contact
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Specify the origins that should be allowed to make requests.
# For local development, include your frontend URL.
origins = [
    "http://localhost:3000",
    # Add other allowed origins if needed.
]

# Add CORSMiddleware to handle preflight OPTIONS requests and set appropriate CORS headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # Allowed origins
    allow_credentials=True,        # Allow cookies, authorization headers, etc.
    # Allow all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_methods=["*"],
    allow_headers=["*"],           # Allow all headers
)

app.include_router(users.router)
app.include_router(records.router)
app.include_router(personal_assistant.router)
app.include_router(contact.router)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the Personal Finance API!"}
