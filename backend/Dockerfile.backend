# backend/Dockerfile
# Use official Python slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev libffi-dev python3-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app

# Expose port (FastAPI default)
EXPOSE 8000

# Command to run the app
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
