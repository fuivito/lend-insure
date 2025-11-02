import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")  # set this in your shell
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

with engine.connect() as conn:
    print(conn.execute(text("select version()")).scalar())
    print(conn.execute(text("select current_database(), current_user")).first())
