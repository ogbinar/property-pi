"""Integration tests for expenses router endpoints."""

import pytest
import httpx
from app.main import app
from app.auth import create_access_token
from app.database import get_db
from app import models


class TestExpenseCRUD:
    async def test_create_expense(self, client: httpx.AsyncClient):
        resp = await client.post("/api/expenses/", json={
            "unit_id": "test-unit-1",
            "amount": 250.00,
            "category": "Repairs",
            "description": "Fix leaky faucet",
            "date": "2026-05-01",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["amount"] == 250.0
        assert data["category"] == "Repairs"
        assert data["status"] == "pending"

    async def test_get_expenses(self, client: httpx.AsyncClient):
        resp = await client.get("/api/expenses/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_get_expense_by_id(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/expenses/", json={
            "unit_id": "test-unit-1",
            "amount": 100.00,
            "category": "Cleaning",
            "description": "Deep clean unit 101",
            "date": "2026-05-01",
        })
        expense_id = create_resp.json()["id"]

        resp = await client.get(f"/api/expenses/{expense_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == expense_id

    async def test_update_expense(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/expenses/", json={
            "unit_id": "test-unit-1",
            "amount": 100.00,
            "category": "Cleaning",
            "description": "Deep clean unit 101",
            "date": "2026-05-01",
        })
        expense_id = create_resp.json()["id"]

        resp = await client.put(f"/api/expenses/{expense_id}", json={
            "amount": 150.00,
        })
        assert resp.status_code == 200
        assert resp.json()["amount"] == 150.0

    async def test_delete_expense(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/expenses/", json={
            "unit_id": "test-unit-1",
            "amount": 100.00,
            "category": "Cleaning",
            "description": "Deep clean unit 101",
            "date": "2026-05-01",
        })
        expense_id = create_resp.json()["id"]

        resp = await client.delete(f"/api/expenses/{expense_id}")
        assert resp.status_code == 204

        # Verify deleted
        get_resp = await client.get(f"/api/expenses/{expense_id}")
        assert get_resp.status_code == 404

    async def test_filter_expenses_by_category(self, client: httpx.AsyncClient):
        await client.post("/api/expenses/", json={
            "unit_id": "test-unit-1",
            "amount": 100.00,
            "category": "Repairs",
            "description": "Fix faucet",
            "date": "2026-05-01",
        })
        await client.post("/api/expenses/", json={
            "unit_id": "test-unit-1",
            "amount": 50.00,
            "category": "Cleaning",
            "description": "Clean unit",
            "date": "2026-05-02",
        })

        resp = await client.get("/api/expenses/?category=Repairs")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert all(e["category"] == "Repairs" for e in data)

    async def test_filter_expenses_by_unit_id(self, client: httpx.AsyncClient):
        await client.post("/api/expenses/", json={
            "unit_id": "filter-unit-1",
            "amount": 100.00,
            "category": "Repairs",
            "description": "Fix faucet",
            "date": "2026-05-01",
        })
        await client.post("/api/expenses/", json={
            "unit_id": "filter-unit-2",
            "amount": 50.00,
            "category": "Cleaning",
            "description": "Clean unit",
            "date": "2026-05-02",
        })

        resp = await client.get("/api/expenses/?unit_id=filter-unit-1")
        assert resp.status_code == 200
        data = resp.json()
        assert all(e["unit_id"] == "filter-unit-1" for e in data)

    async def test_expense_not_found(self, client: httpx.AsyncClient):
        resp = await client.get("/api/expenses/nonexistent-id")
        assert resp.status_code == 404
