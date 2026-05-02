"""Tests for Dokploy deployment configuration fixes.

Validates:
- docker-compose.yml has no Traefik labels, no external networks, no ports
- backend Dockerfile does not shadow compose env vars
- config.py env var names are consistent
- .env.example matches Vite (not Next.js)
- backend/.dockerignore exists
"""

import json
import os
import subprocess
from pathlib import Path

import pytest
import yaml


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class TestDockerCompose:
    """Validate docker-compose.yml for Dokploy compatibility."""

    @pytest.fixture
    def compose(self):
        compose_path = PROJECT_ROOT / "docker-compose.yml"
        assert compose_path.exists(), "docker-compose.yml must exist"
        with open(compose_path) as f:
            return yaml.safe_load(f)

    def test_no_traefik_labels(self, compose):
        """No service should have Traefik labels — Dokploy handles routing."""
        for svc_name, svc in compose.get("services", {}).items():
            labels = svc.get("labels", [])
            traefik_labels = [l for l in labels if "traefik" in l.lower()]
            assert traefik_labels == [], (
                f"Service '{svc_name}' has Traefik labels: {traefik_labels}. "
                "Dokploy manages routing via dashboard — remove all Traefik labels."
            )

    def test_no_external_networks(self, compose):
        """No external networks (e.g., dokploy-network) — Dokploy manages networking."""
        networks = compose.get("networks", {})
        for net_name, net_config in networks.items():
            if isinstance(net_config, dict) and net_config.get("external"):
                assert False, (
                    f"Network '{net_name}' is marked as external. "
                    "Dokploy manages networking — remove external network definitions."
                )
            elif isinstance(net_config, list):
                # networks: [dokploy-network] style
                pass

        # Also check per-service network references
        for svc_name, svc in compose.get("services", {}).items():
            svc_networks = svc.get("networks", [])
            if isinstance(svc_networks, list):
                for net in svc_networks:
                    assert net != "dokploy-network", (
                        f"Service '{svc_name}' references 'dokploy-network'. "
                        "Remove this — Dokploy manages networking."
                    )

    def test_no_ports_section(self, compose):
        """No explicit ports: section — Dokploy exposes ports via UI."""
        for svc_name, svc in compose.get("services", {}).items():
            assert "ports" not in svc, (
                f"Service '{svc_name}' has 'ports:' section. "
                "Dokploy manages port exposure via dashboard — remove it."
            )

    def test_backend_has_working_dir_and_command(self, compose):
        """Backend should have working_dir and explicit command."""
        backend = compose.get("services", {}).get("backend", {})
        assert "working_dir" in backend, "Backend should have working_dir set"
        assert "command" in backend, "Backend should have explicit command"
        assert "uvicorn" in backend["command"], (
            "Backend command should run uvicorn"
        )

    def test_frontend_has_working_dir_and_command(self, compose):
        """Frontend should have working_dir and explicit command."""
        frontend = compose.get("services", {}).get("frontend", {})
        assert "working_dir" in frontend, "Frontend should have working_dir set"
        assert "command" in frontend, "Frontend should have explicit command"

    def test_backend_database_url_not_hardcoded(self, compose):
        """DATABASE_URL should come from compose environment, not Dockerfile."""
        backend = compose.get("services", {}).get("backend", {})
        env = backend.get("environment", {})
        if isinstance(env, dict):
            assert "DATABASE_URL" in env, (
                "DATABASE_URL should be set in compose environment variables"
            )
        elif isinstance(env, list):
            keys = [e.split("=")[0] for e in env if "=" in e]
            assert "DATABASE_URL" in keys, (
                "DATABASE_URL should be set in compose environment variables"
            )

    def test_cors_allows_https(self, compose):
        """CORS origins should include HTTPS for Dokploy deployments."""
        backend = compose.get("services", {}).get("backend", {})
        env = backend.get("environment", {})
        origins = None
        if isinstance(env, dict):
            origins = env.get("ALLOWED_ORIGINS", "")
        elif isinstance(env, list):
            for e in env:
                if e.startswith("ALLOWED_ORIGINS"):
                    origins = e.split("=", 1)[1] if "=" in e else ""
                    break
        if origins:
            assert "https://" in origins, (
                "ALLOWED_ORIGINS should include HTTPS origin for Dokploy deployments. "
                f"Current: {origins}"
            )

    def test_default_network_not_defined(self, compose):
        """Should not define a 'default' network — Dokploy manages it."""
        networks = compose.get("networks", {})
        if "default" in networks:
            assert False, (
                "Explicit 'default' network definition should be removed. "
                "Dokploy manages networking."
            )


class TestBackendDockerfile:
    """Validate backend Dockerfile for Dokploy compatibility."""

    @pytest.fixture
    def dockerfile(self):
        path = PROJECT_ROOT / "backend" / "Dockerfile"
        assert path.exists(), "backend/Dockerfile must exist"
        return path.read_text()

    def test_no_hardcoded_database_url(self, dockerfile):
        """DATABASE_URL should not be hardcoded — set via compose."""
        lines = [l.strip() for l in dockerfile.splitlines() if l.strip()]
        db_url_lines = [l for l in lines if l.startswith("ENV DATABASE_URL=")]
        assert db_url_lines == [], (
            f"DATABASE_URL is hardcoded in Dockerfile: {db_url_lines}. "
            "Remove it — Docker Compose sets this at runtime."
        )

    def test_no_hardcoded_jwt_secret(self, dockerfile):
        """JWT secret should not be hardcoded — set via compose."""
        lines = [l.strip() for l in dockerfile.splitlines() if l.strip()]
        jwt_lines = [l for l in lines if l.startswith("ENV JWT_SECRET=")]
        assert jwt_lines == [], (
            f"JWT_SECRET is hardcoded in Dockerfile: {jwt_lines}. "
            "Remove it — Docker Compose sets this at runtime."
        )

    def test_no_jwt_expiration_env(self, dockerfile):
        """JWT_EXPIRATION_MINUTES should not be hardcoded — config.py reads ACCESS_TOKEN_EXPIRE_MINUTES."""
        lines = [l.strip() for l in dockerfile.splitlines() if l.strip()]
        exp_lines = [l for l in lines if "JWT_EXPIRATION_MINUTES" in l]
        assert exp_lines == [], (
            f"JWT_EXPIRATION_MINUTES is in Dockerfile: {exp_lines}. "
            "Remove it — config.py reads ACCESS_TOKEN_EXPIRE_MINUTES, not JWT_EXPIRATION_MINUTES."
        )

    def test_exposes_port_8000(self, dockerfile):
        """Backend should EXPOSE 8000."""
        assert "EXPOSE 8000" in dockerfile, "Backend Dockerfile should EXPOSE 8000"


class TestConfigEnvVars:
    """Validate that config.py env var names are consistent."""

    def test_settings_reads_secret_key(self):
        """Settings should read SECRET_KEY, not JWT_SECRET."""
        from app.config import Settings
        s = Settings(SECRET_KEY="test-key")
        assert s.jwt_secret == "test-key"

    def test_settings_reads_access_token_expire_minutes(self):
        """Settings should read ACCESS_TOKEN_EXPIRE_MINUTES, not JWT_EXPIRATION_MINUTES."""
        from app.config import Settings
        s = Settings(ACCESS_TOKEN_EXPIRE_MINUTES=60)
        assert s.access_token_expire_minutes == 60

    def test_dockerfile_does_not_set_jwt_secret(self):
        """Dockerfile should NOT set JWT_SECRET env var (would shadow compose SECRET_KEY)."""
        dockerfile = (PROJECT_ROOT / "backend" / "Dockerfile").read_text()
        assert "JWT_SECRET" not in dockerfile, (
            "Dockerfile should not set JWT_SECRET. "
            "This would shadow the SECRET_KEY env var from Docker Compose."
        )

    def test_dockerfile_does_not_set_jwt_expiration_minutes(self):
        """Dockerfile should NOT set JWT_EXPIRATION_MINUTES (config reads ACCESS_TOKEN_EXPIRE_MINUTES)."""
        dockerfile = (PROJECT_ROOT / "backend" / "Dockerfile").read_text()
        assert "JWT_EXPIRATION" not in dockerfile, (
            "Dockerfile should not set JWT_EXPIRATION_MINUTES. "
            "config.py reads ACCESS_TOKEN_EXPIRE_MINUTES, not JWT_EXPIRATION_MINUTES."
        )

    def test_settings_does_not_read_jwt_expiration_minutes(self):
        """Setting JWT_EXPIRATION_MINUTES env var should NOT affect Settings."""
        from app.config import Settings as S
        old = os.environ.pop("ACCESS_TOKEN_EXPIRE_MINUTES", None)
        try:
            os.environ["JWT_EXPIRATION_MINUTES"] = "999"
            s = S()
            assert s.access_token_expire_minutes != 999, (
                "Settings should NOT read JWT_EXPIRATION_MINUTES env var. "
                "It reads ACCESS_TOKEN_EXPIRE_MINUTES."
            )
        finally:
            if old:
                os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = old
            os.environ.pop("JWT_EXPIRATION_MINUTES", None)


class TestEnvExample:
    """Validate .env.example matches the project stack."""

    def test_env_example_exists(self):
        path = PROJECT_ROOT / ".env.example"
        assert path.exists(), ".env.example must exist"

    def test_no_next_js_vars(self):
        """Should not contain Next.js env vars — this is Vite, not Next.js."""
        path = PROJECT_ROOT / ".env.example"
        content = path.read_text()
        assert "NEXT_PUBLIC" not in content, (
            ".env.example contains NEXT_PUBLIC_ variables. "
            "Property-Pi uses Vite, not Next.js. Use VITE_ prefix."
        )

    def test_no_vite_vars_with_nextjs_prefix(self):
        """Should not use NEXT_PUBLIC_API_URL."""
        path = PROJECT_ROOT / ".env.example"
        content = path.read_text()
        assert "NEXT_PUBLIC_API_URL" not in content, (
            ".env.example uses NEXT_PUBLIC_API_URL. Use VITE_API_BASE_URL instead."
        )


class TestDockerIgnore:
    """Validate .dockerignore files exist and have correct contents."""

    def test_backend_dockerignore_exists(self):
        path = PROJECT_ROOT / "backend" / ".dockerignore"
        assert path.exists(), "backend/.dockerignore must exist to exclude .venv and __pycache__"

    def test_backend_dockerignore_excludes_venv(self):
        path = PROJECT_ROOT / "backend" / ".dockerignore"
        content = path.read_text()
        assert ".venv" in content, ".dockerignore should exclude .venv"

    def test_backend_dockerignore_excludes_pycache(self):
        path = PROJECT_ROOT / "backend" / ".dockerignore"
        content = path.read_text()
        assert "__pycache__" in content, ".dockerignore should exclude __pycache__"
