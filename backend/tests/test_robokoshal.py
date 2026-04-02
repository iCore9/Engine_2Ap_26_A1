"""Backend API tests for Robokoshal Platform"""
import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://key-3.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "robokoshal@gmail.com"
ADMIN_PASSWORD = "robo@KOSHAL()149#"


@pytest.fixture(scope="module")
def admin_token():
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# AUTH TESTS
class TestAuth:
    def test_login_success(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "super_admin"

    def test_login_wrong_password(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpassword"})
        assert resp.status_code == 401

    def test_get_me(self, auth_headers):
        resp = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == ADMIN_EMAIL


# TEAM TESTS
class TestTeam:
    def test_get_team_returns_4_members(self):
        resp = requests.get(f"{BASE_URL}/api/team")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 4
        names = [m["name"] for m in data]
        assert "Akashdeep Singh Chaudhary" in names
        assert "Navdeep Singh Chaudhary" in names
        assert "Saurabh Dixit" in names
        assert "Ajay Tyagi" in names

    def test_team_member_structure(self):
        resp = requests.get(f"{BASE_URL}/api/team")
        assert resp.status_code == 200
        member = resp.json()[0]
        assert "id" in member
        assert "name" in member
        assert "role" in member
        assert "_id" not in member


# PORTFOLIO TESTS
class TestPortfolio:
    def test_get_portfolio_returns_5_items(self):
        resp = requests.get(f"{BASE_URL}/api/portfolio")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 5

    def test_portfolio_item_structure(self):
        resp = requests.get(f"{BASE_URL}/api/portfolio")
        item = resp.json()[0]
        assert "id" in item
        assert "title" in item
        assert "category" in item
        assert "_id" not in item


# PROGRAMS TESTS
class TestPrograms:
    def test_get_all_programs(self):
        resp = requests.get(f"{BASE_URL}/api/programs")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 3

    def test_get_btech_program(self):
        resp = requests.get(f"{BASE_URL}/api/programs/btech")
        assert resp.status_code == 200
        data = resp.json()
        assert data["program_type"] == "btech"
        assert data["total_seats"] == 60

    def test_get_diploma_program(self):
        resp = requests.get(f"{BASE_URL}/api/programs/diploma")
        assert resp.status_code == 200

    def test_get_partner_diploma_program(self):
        resp = requests.get(f"{BASE_URL}/api/programs/partner_diploma")
        assert resp.status_code == 200

    def test_get_nonexistent_program(self):
        resp = requests.get(f"{BASE_URL}/api/programs/nonexistent")
        assert resp.status_code == 404


# FINANCE TESTS
class TestFinance:
    def test_get_btech_finance(self):
        resp = requests.get(f"{BASE_URL}/api/finance/btech")
        assert resp.status_code == 200
        data = resp.json()
        assert data["program_type"] == "btech"
        assert "total_seats" in data
        assert "university_share" in data
        assert "robokoshal_share" in data
        assert "opex_items" in data

    def test_get_diploma_finance(self):
        resp = requests.get(f"{BASE_URL}/api/finance/diploma")
        assert resp.status_code == 200

    def test_get_partner_diploma_finance(self):
        resp = requests.get(f"{BASE_URL}/api/finance/partner_diploma")
        assert resp.status_code == 200


# LAB PLANNER TESTS
class TestLabPlanner:
    def test_get_lab_items(self):
        resp = requests.get(f"{BASE_URL}/api/lab-planner")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) > 0

    def test_lab_items_have_categories(self):
        resp = requests.get(f"{BASE_URL}/api/lab-planner")
        data = resp.json()
        categories = set(item["category"] for item in data)
        assert "Civil Work & Interiors" in categories
        assert "Furniture & Storage" in categories
        assert "Electronics Hardware" in categories
        assert "Robot Platforms" in categories

    def test_lab_item_structure(self):
        resp = requests.get(f"{BASE_URL}/api/lab-planner")
        item = resp.json()[0]
        assert "id" in item
        assert "category" in item
        assert "name" in item
        assert "unit_price" in item
        assert "preset" in item
        assert "_id" not in item


# TESTIMONIALS TESTS
class TestTestimonials:
    def test_get_testimonials(self):
        resp = requests.get(f"{BASE_URL}/api/testimonials")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) > 0
        assert "author" in data[0]


# USERS TESTS (admin only)
class TestUsers:
    def test_get_users_requires_auth(self):
        resp = requests.get(f"{BASE_URL}/api/users")
        assert resp.status_code == 401

    def test_get_users_as_admin(self, auth_headers):
        resp = requests.get(f"{BASE_URL}/api/users", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1
