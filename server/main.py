from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from database import engine, Base
# from config import settings
# import uvicorn

# Import routers
# from routers import health, clients, policies, agreements, dashboard, proposals

# Create tables
Base.metadata.create_all(bind=engine)

# app = FastAPI(
#     title="Lendinsure Broker API",
#     description="Backend service for broker operations",
#     version="1.0.0",
#     docs_url="/docs",
#     redoc_url="/redoc"
# )


app = FastAPI()



# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/health")
def health():
    return {"ok": True}

# # Register routers
# app.include_router(health.router)
# app.include_router(clients.router)
# app.include_router(policies.router)
# app.include_router(agreements.router)
# app.include_router(dashboard.router)
# app.include_router(proposals.router)

# if __name__ == "__main__":
#     print(f"🚀 Starting Lendinsure Broker API on port {settings.PORT}")
#     print(f"📚 API docs available at http://localhost:{settings.PORT}/docs")
    
#     uvicorn.run(
#         "main:app",
#         host="0.0.0.0",
#         port=settings.PORT,
#         reload=settings.ENVIRONMENT == "development"
#     )


