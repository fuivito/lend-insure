from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import health#, clients#,agreements, dashboard, policies, proposals

app = FastAPI(
    title="LendInsure API",
    description="Insurance financing platform API",
    version="1.0.0"
)

# TEMP CORS for first run; tighten later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later replace with your Lovable domain
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"ok": True, "service": "lendinsure-api"}

# Register routers
app.include_router(health.router)
# app.include_router(agreements.router)
# app.include_router(clients.router)
# app.include_router(dashboard.router)
# app.include_router(policies.router)
# app.include_router(proposals.router)
