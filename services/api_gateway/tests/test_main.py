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

