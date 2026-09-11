from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to GliTch API"

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "GliTch FastAPI Engine"

def test_get_items():
    response = client.get("/api/items")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 1

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
