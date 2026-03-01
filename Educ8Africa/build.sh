#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run database migrations using Alembic
alembic upgrade head

# Start the FastAPI application with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port $PORT
