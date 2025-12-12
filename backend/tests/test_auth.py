# tests/test_auth.py
"""Basic tests for authentication endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(scope="module")
def test_user():
    # Register a user
    response = client.post("/api/v1/auth/register", json={"email": "test@example.com", "password": "secret123", "full_name": "Test User"})
    assert response.status_code == 200
    return response.json()

def test_login(test_user):
    response = client.post("/api/v1/auth/login", data={"username": "test@example.com", "password": "secret123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
