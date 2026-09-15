from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to GliTch Central Control Plane API"

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "GliTch Control Plane Engine"

def test_get_and_create_applications():
    # Verify initial get
    response = client.get("/api/v1/applications")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # Create new app
    new_app = {
        "name": "Ecom Test Platform",
        "repository": "github.com/glitch/ecom-test",
        "default_branch": "main",
        "technology": "Node.js / React"
    }
    create_res = client.post("/api/v1/applications", json=new_app)
    assert create_res.status_code == 201
    created_app = create_res.json()
    assert created_app["name"] == new_app["name"]
    app_id = created_app["id"]

    # Delete test app
    del_res = client.delete(f"/api/v1/applications/{app_id}")
    assert del_res.status_code == 200

def test_get_deployments():
    response = client.get("/api/v1/deployments")
    assert response.status_code == 200
    deps = response.json()
    assert isinstance(deps, list)

def test_create_and_delete_item():
    new_item = {
        "title": "CI Test Component",
        "description": "Created during automated pytest execution.",
        "category": "Architecture"
    }
    create_res = client.post("/api/items", json=new_item)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["title"] == new_item["title"]
    item_id = created_data["id"]

    delete_res = client.delete(f"/api/items/{item_id}")
    assert delete_res.status_code == 200

def test_agent_exec_endpoint():
    exec_req = {"command": "uptime"}
    res = client.post("/api/v1/agents/agent-01/exec", json=exec_req)
    assert res.status_code == 200
    data = res.json()
    assert "exec_id" in data
    assert data["agent_id"] == "agent-01"
    assert data["command"] == "uptime"

def test_deployment_rollback_endpoint():
    # First create application, build, and deployment
    app_res = client.post("/api/v1/applications", json={
        "name": "Rollback App",
        "repository": "github.com/glitch/rollback-test",
        "default_branch": "main"
    })
    app_id = app_res.json()["id"]

    dep_create = {
        "build_id": "build-01",
        "site_id": "site-01",
        "environment": "Production",
        "strategy": "STANDARD"
    }
    dep_res = client.post("/api/v1/deployments", json=dep_create)
    assert dep_res.status_code == 201
    dep_id = dep_res.json()["id"]

    # Trigger rollback
    rollback_res = client.post(f"/api/v1/deployments/{dep_id}/rollback", json={"reason": "Test failure"})
    assert rollback_res.status_code == 200
    rollback_data = rollback_res.json()
    assert rollback_data["deployment_id"] == dep_id
    assert "rollback_id" in rollback_data

    # Cleanup
    client.delete(f"/api/v1/applications/{app_id}")

def test_agent_heartbeat_endpoint():
    """Test the REST heartbeat endpoint for edge agents."""
    heartbeat_payload = {
        "site_id": "site-001",
        "agent_code": "agent-99",
        "hostname": "edge-test-node",
        "ip_address": "192.168.1.100",
        "version": "v2.4.0",
        "cpu_percent": 14.2,
        "memory_percent": 38.6
    }
    res = client.post("/api/v1/agents/heartbeat", json=heartbeat_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "received"
    assert data["agent_id"] == "agent-99"

    # Verify the agent is registered
    agents_res = client.get("/api/v1/agents")
    assert agents_res.status_code == 200
    agents = agents_res.json()
    assert any(a["id"] == "agent-99" for a in agents)
    registered = next(a for a in agents if a["id"] == "agent-99")
    assert registered["cpu_percent"] == 14.2
    assert registered["memory_percent"] == 38.6

def test_site_crud_endpoints():
    """Test full CRUD for Sites including new GET/DELETE by ID endpoints."""
    # Create a client first
    client_res = client.post("/api/v1/clients", json={
        "name": "Test Client",
        "code": "TC"
    })
    assert client_res.status_code == 201
    client_id = client_res.json()["id"]

    # Create a site
    site_res = client.post("/api/v1/sites", json={
        "client_id": client_id,
        "name": "Test Site",
        "code": "TS",
        "environment": "Production",
        "location": "US-East"
    })
    assert site_res.status_code == 201
    site_id = site_res.json()["id"]

    # GET single site
    get_res = client.get(f"/api/v1/sites/{site_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == site_id

    # DELETE site
    del_res = client.delete(f"/api/v1/sites/{site_id}")
    assert del_res.status_code == 200

    # Cleanup client
    client.delete(f"/api/v1/clients/{client_id}")

def test_agent_model_includes_telemetry_fields():
    """Verify Agent model exposes cpu_percent and memory_percent fields."""
    from main import Agent
    agent = Agent(
        id="agent-01",
        site_id="site-001",
        agent_code="AGENT-01",
        hostname="edge-node-01",
        ip_address="192.168.1.105",
        site_name="BLR-01",
        status="ONLINE",
        last_seen="Just now",
        cpu_percent=18.5,
        memory_percent=42.1
    )
    assert agent.cpu_percent == 18.5
    assert agent.memory_percent == 42.1
    dumped = agent.model_dump()
    assert "cpu_percent" in dumped
    assert "memory_percent" in dumped


