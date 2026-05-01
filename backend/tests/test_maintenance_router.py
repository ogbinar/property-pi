"""Integration tests for maintenance router endpoints."""

import pytest
import httpx
from app.main import app
from app.auth import create_access_token
from app import models


class TestMaintenanceCRUD:
    async def test_create_maintenance(self, client: httpx.AsyncClient):
        resp = await client.post("/api/maintenance/", json={
            "unit_id": "test-unit-1",
            "title": "Leaky faucet",
            "description": "Kitchen faucet is dripping",
            "priority": "high",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Leaky faucet"
        assert data["priority"] == "high"
        assert data["status"] == "open"

    async def test_get_maintenance(self, client: httpx.AsyncClient):
        resp = await client.get("/api/maintenance/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_get_maintenance_by_id(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/maintenance/", json={
            "unit_id": "test-unit-1",
            "title": "Broken AC",
            "description": "AC not cooling",
            "priority": "urgent",
        })
        req_id = create_resp.json()["id"]

        resp = await client.get(f"/api/maintenance/{req_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == req_id

    async def test_update_maintenance(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/maintenance/", json={
            "unit_id": "test-unit-1",
            "title": "Broken AC",
            "description": "AC not cooling",
            "priority": "urgent",
        })
        req_id = create_resp.json()["id"]

        resp = await client.put(f"/api/maintenance/{req_id}", json={
            "status": "in_progress",
            "priority": "high",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "in_progress"
        assert data["priority"] == "high"

    async def test_delete_maintenance(self, client: httpx.AsyncClient):
        create_resp = await client.post("/api/maintenance/", json={
            "unit_id": "test-unit-1",
            "title": "Broken AC",
            "description": "AC not cooling",
            "priority": "urgent",
        })
        req_id = create_resp.json()["id"]

        resp = await client.delete(f"/api/maintenance/{req_id}")
        assert resp.status_code == 204

        get_resp = await client.get(f"/api/maintenance/{req_id}")
        assert get_resp.status_code == 404

    async def test_filter_maintenance_by_unit_id(self, client: httpx.AsyncClient):
        await client.post("/api/maintenance/", json={
            "unit_id": "maint-unit-1",
            "title": "Fix door",
            "description": "Door stuck",
            "priority": "medium",
        })
        await client.post("/api/maintenance/", json={
            "unit_id": "maint-unit-2",
            "title": "Replace light",
            "description": "Light burnt out",
            "priority": "low",
        })

        resp = await client.get("/api/maintenance/?unit_id=maint-unit-1")
        assert resp.status_code == 200
        data = resp.json()
        assert all(m["unit_id"] == "maint-unit-1" for m in data)

    async def test_maintenance_not_found(self, client: httpx.AsyncClient):
        resp = await client.get("/api/maintenance/nonexistent-id")
        assert resp.status_code == 404
