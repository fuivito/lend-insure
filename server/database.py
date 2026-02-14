from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from config import settings

# Supabase Postgres requires SSL in production. Normalize URL and enforce SSL.
def _normalize_database_url(url: str) -> str:
    if not url:
        return url
    # Convert postgres:// to postgresql:// for SQLAlchemy compatibility
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url

normalized_url = _normalize_database_url(settings.DATABASE_URL)

# For Supabase, ensure SSL is enabled unless explicitly disabled
connect_args = {}
if normalized_url and "supabase.co" in normalized_url:
    connect_args = {"sslmode": "require"}

# Use NullPool for serverless — no point maintaining a pool in a short-lived function
engine = create_engine(normalized_url, connect_args=connect_args, poolclass=NullPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
