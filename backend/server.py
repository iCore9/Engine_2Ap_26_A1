from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime, timezone, timedelta
import os, jwt, bcrypt, logging, secrets
from pathlib import Path

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "robokoshal@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "robo@KOSHAL()149#")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Robokoshal Platform API")
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======= HELPERS =======
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def doc_to_dict(doc: dict) -> dict:
    if doc is None:
        return None
    result = dict(doc)
    result["id"] = str(result.pop("_id"))
    return result

async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user or not user.get("is_active", True):
            raise HTTPException(status_code=401, detail="User not found or inactive")
        user["id"] = str(user["_id"])
        del user["_id"]
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_editor(request: Request) -> dict:
    user = await get_current_user(request)
    if user["role"] not in ["super_admin", "team_editor"]:
        raise HTTPException(status_code=403, detail="Editor access required")
    return user

async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ======= MODELS =======
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "team_editor"

class TeamMemberModel(BaseModel):
    name: str
    role: str
    bio: str = ""
    skills: List[str] = []
    linkedin: str = ""
    photo_url: str = ""
    projects: List[str] = []
    order: int = 0

class PortfolioItemModel(BaseModel):
    title: str
    category: str
    level: str = "intermediate"
    description: str = ""
    technologies: List[str] = []
    educational_value: str = ""
    course_relevance: str = ""
    image_url: str = ""
    outcomes: str = ""
    order: int = 0

class ProgramModel(BaseModel):
    program_type: str
    name: str
    description: str = ""
    duration: str
    semesters: int
    total_seats: int
    year1_fee: float
    year2_fee: float
    year3_fee: float = 0
    year4_fee: float = 0
    eligibility: str = ""
    target_audience: str = ""
    key_modules: List[str] = []
    learning_outcomes: List[str] = []
    career_pathways: List[str] = []

class FinanceSettingsModel(BaseModel):
    program_type: str
    total_seats: int
    conversion_rate: float = 100
    year1_fee: float
    year2_fee: float
    year3_fee: float = 0
    year4_fee: float = 0
    scholarship_pct: float = 0
    university_share: float
    robokoshal_share: float
    partner_share: float = 0
    growth_rate: float = 10
    opex_items: List[Dict] = []

class LabItemModel(BaseModel):
    category: str
    name: str
    quantity: int = 1
    unit_price: float
    necessity: str = "must-have"
    preset: str = "recommended"
    is_recurring: bool = False
    comments: str = ""
    order: int = 0

class TestimonialModel(BaseModel):
    author: str
    role: str
    organization: str
    quote: str
    avatar_url: str = ""
    order: int = 0

# ======= AUTH =======
@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email.lower().strip()})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account disabled")
    token = create_token(str(user["_id"]), user["email"], user["role"])
    user_data = doc_to_dict(user)
    user_data.pop("password_hash", None)
    return {"access_token": token, "user": user_data}

@api_router.post("/auth/register")
async def register(req: RegisterRequest, _=Depends(require_admin)):
    existing = await db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": req.email.lower().strip(), "name": req.name,
        "password_hash": hash_password(req.password), "role": req.role,
        "is_active": True, "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None); doc.pop("password_hash", None)
    return doc

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return user

# ======= USERS =======
@api_router.get("/users")
async def list_users(_=Depends(require_admin)):
    users = await db.users.find({}, {"password_hash": 0}).to_list(1000)
    return [doc_to_dict(u) for u in users]

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, data: Dict[str, Any], _=Depends(require_admin)):
    data.pop("password_hash", None); data.pop("_id", None)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": data})
    updated = await db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    return doc_to_dict(updated)

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, _=Depends(require_admin)):
    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"success": True}

# ======= TEAM =======
@api_router.get("/team")
async def get_team():
    members = await db.team.find().sort("order", 1).to_list(100)
    return [doc_to_dict(m) for m in members]

@api_router.post("/team")
async def create_team_member(member: TeamMemberModel, _=Depends(require_editor)):
    doc = member.model_dump()
    result = await db.team.insert_one(doc)
    doc["id"] = str(result.inserted_id); doc.pop("_id", None)
    return doc

@api_router.put("/team/{member_id}")
async def update_team_member(member_id: str, member: TeamMemberModel, _=Depends(require_editor)):
    await db.team.update_one({"_id": ObjectId(member_id)}, {"$set": member.model_dump()})
    updated = await db.team.find_one({"_id": ObjectId(member_id)})
    return doc_to_dict(updated)

@api_router.delete("/team/{member_id}")
async def delete_team_member(member_id: str, _=Depends(require_editor)):
    await db.team.delete_one({"_id": ObjectId(member_id)})
    return {"success": True}

# ======= PORTFOLIO =======
@api_router.get("/portfolio")
async def get_portfolio():
    items = await db.portfolio.find().sort("order", 1).to_list(100)
    return [doc_to_dict(i) for i in items]

@api_router.post("/portfolio")
async def create_portfolio_item(item: PortfolioItemModel, _=Depends(require_editor)):
    doc = item.model_dump()
    result = await db.portfolio.insert_one(doc)
    doc["id"] = str(result.inserted_id); doc.pop("_id", None)
    return doc

@api_router.put("/portfolio/{item_id}")
async def update_portfolio_item(item_id: str, item: PortfolioItemModel, _=Depends(require_editor)):
    await db.portfolio.update_one({"_id": ObjectId(item_id)}, {"$set": item.model_dump()})
    updated = await db.portfolio.find_one({"_id": ObjectId(item_id)})
    return doc_to_dict(updated)

@api_router.delete("/portfolio/{item_id}")
async def delete_portfolio_item(item_id: str, _=Depends(require_editor)):
    await db.portfolio.delete_one({"_id": ObjectId(item_id)})
    return {"success": True}

# ======= PROGRAMS =======
@api_router.get("/programs")
async def get_programs():
    programs = await db.programs.find().to_list(10)
    return [doc_to_dict(p) for p in programs]

@api_router.get("/programs/{program_type}")
async def get_program(program_type: str):
    program = await db.programs.find_one({"program_type": program_type})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return doc_to_dict(program)

@api_router.put("/programs/{program_type}")
async def update_program(program_type: str, program: ProgramModel, _=Depends(require_editor)):
    await db.programs.update_one({"program_type": program_type}, {"$set": program.model_dump()}, upsert=True)
    updated = await db.programs.find_one({"program_type": program_type})
    return doc_to_dict(updated)

# ======= FINANCE =======
@api_router.get("/finance/{program_type}")
async def get_finance_settings(program_type: str):
    settings = await db.finance.find_one({"program_type": program_type})
    if not settings:
        raise HTTPException(status_code=404, detail="Finance settings not found")
    return doc_to_dict(settings)

@api_router.put("/finance/{program_type}")
async def update_finance_settings(program_type: str, settings: FinanceSettingsModel, _=Depends(require_editor)):
    await db.finance.update_one({"program_type": program_type}, {"$set": settings.model_dump()}, upsert=True)
    updated = await db.finance.find_one({"program_type": program_type})
    return doc_to_dict(updated)

# ======= LAB PLANNER =======
@api_router.get("/lab-planner")
async def get_lab_items():
    items = await db.lab_items.find().sort([("category", 1), ("order", 1)]).to_list(1000)
    return [doc_to_dict(i) for i in items]

@api_router.post("/lab-planner/item")
async def create_lab_item(item: LabItemModel, _=Depends(require_editor)):
    doc = item.model_dump()
    result = await db.lab_items.insert_one(doc)
    doc["id"] = str(result.inserted_id); doc.pop("_id", None)
    return doc

@api_router.put("/lab-planner/item/{item_id}")
async def update_lab_item(item_id: str, item: LabItemModel, _=Depends(require_editor)):
    await db.lab_items.update_one({"_id": ObjectId(item_id)}, {"$set": item.model_dump()})
    updated = await db.lab_items.find_one({"_id": ObjectId(item_id)})
    return doc_to_dict(updated)

@api_router.delete("/lab-planner/item/{item_id}")
async def delete_lab_item(item_id: str, _=Depends(require_editor)):
    await db.lab_items.delete_one({"_id": ObjectId(item_id)})
    return {"success": True}

@api_router.put("/lab-planner/bulk")
async def bulk_update_lab_items(items: List[Dict], _=Depends(require_editor)):
    for item in items:
        item_id = item.pop("id", None)
        item.pop("_id", None)
        if item_id:
            await db.lab_items.update_one({"_id": ObjectId(item_id)}, {"$set": item})
    return {"success": True}

# ======= TESTIMONIALS =======
@api_router.get("/testimonials")
async def get_testimonials():
    items = await db.testimonials.find().sort("order", 1).to_list(100)
    return [doc_to_dict(i) for i in items]

@api_router.post("/testimonials")
async def create_testimonial(item: TestimonialModel, _=Depends(require_editor)):
    doc = item.model_dump()
    result = await db.testimonials.insert_one(doc)
    doc["id"] = str(result.inserted_id); doc.pop("_id", None)
    return doc

@api_router.put("/testimonials/{item_id}")
async def update_testimonial(item_id: str, item: TestimonialModel, _=Depends(require_editor)):
    await db.testimonials.update_one({"_id": ObjectId(item_id)}, {"$set": item.model_dump()})
    updated = await db.testimonials.find_one({"_id": ObjectId(item_id)})
    return doc_to_dict(updated)

@api_router.delete("/testimonials/{item_id}")
async def delete_testimonial(item_id: str, _=Depends(require_editor)):
    await db.testimonials.delete_one({"_id": ObjectId(item_id)})
    return {"success": True}

# ======= APP SETUP =======
app.include_router(api_router)

@app.on_event("startup")
async def startup():
    await seed_initial_data()

async def seed_initial_data():
    # Seed admin user
    admin_email = ADMIN_EMAIL.lower()
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "email": admin_email, "name": "Robokoshal Admin",
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "super_admin", "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(ADMIN_PASSWORD, existing_admin["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}}
        )
        logger.info("Admin password updated")

    if await db.team.count_documents({}) == 0:
        await db.team.insert_many([
            {"name": "Akashdeep Singh Chaudhary", "role": "Program & Robotics Mentor", "bio": "Leads hands-on learning programs, drives technical project execution, and shapes innovation-focused curriculum design. Specializes in robotics, automation, and embedded systems.", "skills": ["Robotics", "Automation", "Embedded Systems", "Arduino", "ROS", "Curriculum Design"], "linkedin": "", "photo_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop", "projects": ["Quadruped Robot", "Spider Robot", "B.Tech IRS Curriculum"], "order": 1},
            {"name": "Navdeep Singh Chaudhary", "role": "AI & Emerging Technologies Mentor", "bio": "Mentors on practical tech applications, guides research-oriented learning, and facilitates project-based skill development. Specializes in AI, Machine Learning, and IoT.", "skills": ["Artificial Intelligence", "Machine Learning", "IoT", "Python", "TensorFlow"], "linkedin": "", "photo_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop", "projects": ["AI Vision Robot", "IoT Smart Systems"], "order": 2},
            {"name": "Saurabh Dixit", "role": "Industry & Internship Mentor", "bio": "Prepares students for internship success, bridges academic learning with industry needs. Extensive industry experience in technology and applied engineering.", "skills": ["Industry Relations", "Project Management", "Career Guidance", "Applied Engineering"], "linkedin": "", "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop", "projects": ["Industry Connect Program", "Internship Pipeline"], "order": 3},
            {"name": "Ajay Tyagi", "role": "AI/ML Engineer & Learning Mentor", "bio": "Supports practical AI implementation, develops structured learning pathways, conducts comprehensive skill assessments. Proven experience in applied machine learning solutions.", "skills": ["AI/ML Engineering", "Deep Learning", "Skill Assessment", "Learning Design"], "linkedin": "", "photo_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop", "projects": ["ML Lab Framework", "Assessment Platform"], "order": 4},
        ])

    if await db.portfolio.count_documents({}) == 0:
        await db.portfolio.insert_many([
            {"title": "Hexapod Spider Robot", "category": "Advanced Robotics", "level": "advanced", "description": "A 6-legged spider-inspired robot with articulated joints, controlled via Arduino MEGA 2560. Features multi-gait locomotion algorithms, obstacle sensing with HC-SR04, and 3D-printed structural components.", "technologies": ["Arduino MEGA 2560", "Servo Motors (18x)", "HC-SR04", "3D Printing", "C++ Gait Algorithms"], "educational_value": "Teaches mechanics, kinematics, servo control, gait programming, and sensor integration.", "course_relevance": "B.Tech Year 3-4, Advanced Robotics Module", "image_url": "https://images.pexels.com/photos/2085832/pexels-photo-2085832.jpeg?auto=compress&cs=tinysrgb&w=800", "outcomes": "Students master hexapod locomotion and multi-servo coordination.", "order": 1},
            {"title": "Quadruped Robot Dog", "category": "Advanced Robotics", "level": "advanced", "description": "4-legged robotic platform mimicking animal locomotion. Advanced servo control for dynamic balance, terrain adaptation, and remote control.", "technologies": ["Servo Control", "IMU Sensors", "ROS", "Python", "Inverse Kinematics"], "educational_value": "Advanced kinematics, dynamic balance, ROS integration, and real-time control systems.", "course_relevance": "B.Tech Year 4, Advanced Robotics Module", "image_url": "https://images.pexels.com/photos/32998808/pexels-photo-32998808.jpeg?auto=compress&cs=tinysrgb&w=800", "outcomes": "Exposure to cutting-edge legged robotics used in industry research.", "order": 2},
            {"title": "Autonomous Rover (Level 2)", "category": "Educational Robotics", "level": "intermediate", "description": "Wheeled autonomous rover with motor driver control, obstacle avoidance, and line-following capabilities. Built on modular Arduino platform.", "technologies": ["Arduino UNO", "L298N Motor Driver", "IR Sensors", "Ultrasonic Sensor", "PWM Control"], "educational_value": "Motor control, sensor fusion, PID control, and autonomous navigation fundamentals.", "course_relevance": "B.Tech Year 1-2, Diploma Core Module", "image_url": "https://images.pexels.com/photos/8439002/pexels-photo-8439002.jpeg?auto=compress&cs=tinysrgb&w=800", "outcomes": "Foundation for understanding autonomous systems and embedded control.", "order": 3},
            {"title": "Component Architecture Car (Level 3)", "category": "Educational Robotics", "level": "advanced", "description": "Multi-module robot car with distributed architecture. Separate modules for navigation, sensing, communication, and decision-making. Designed for teaching systems architecture.", "technologies": ["Arduino Mega", "Multiple Sensors", "Bluetooth Module", "I2C Bus", "Modular Design"], "educational_value": "Distributed systems, modular programming, and system integration principles.", "course_relevance": "B.Tech Year 2-3, Systems Architecture Module", "image_url": "https://images.pexels.com/photos/8438967/pexels-photo-8438967.jpeg?auto=compress&cs=tinysrgb&w=800", "outcomes": "Students learn scalable, modular robotic system design.", "order": 4},
            {"title": "Arduino Motor Driver System", "category": "Electronics & Control", "level": "basic", "description": "Comprehensive motor driver and control system on Arduino. Includes H-bridge drivers, PWM speed control, encoder feedback, and LCD interface for real-time monitoring.", "technologies": ["Arduino", "L298N", "L293D", "Encoders", "LCD Display", "PWM"], "educational_value": "Core electronics and motor control foundation for all robotics programs.", "course_relevance": "All Programs – Foundation Module", "image_url": "https://images.pexels.com/photos/35673128/pexels-photo-35673128.jpeg?auto=compress&cs=tinysrgb&w=800", "outcomes": "Essential skills for any robotics or embedded systems engineer.", "order": 5},
        ])

    if await db.programs.count_documents({}) == 0:
        await db.programs.insert_many([
            {"program_type": "btech", "name": "B.Tech Intelligent Robotic Systems", "description": "India's most comprehensive B.Tech program focusing on intelligent robotics, AI integration, and autonomous systems. Aligned with NEP 2020 and AICTE guidelines.", "duration": "4 Years", "semesters": 8, "total_seats": 60, "year1_fee": 240550, "year2_fee": 229550, "year3_fee": 229550, "year4_fee": 229550, "eligibility": "10+2 with PCM. JEE qualified preferred.", "target_audience": "Engineering students passionate about robotics, AI, and automation.", "key_modules": ["Arduino & Embedded Systems", "Raspberry Pi & SBC Programming", "ROS (Robot Operating System)", "Computer Vision & AI", "Intelligent Robotic Systems Capstone"], "learning_outcomes": ["Design and build autonomous robotic systems", "Implement AI algorithms for robot perception", "Develop ROS-based robotic applications", "Lead robotics R&D projects"], "career_pathways": ["Robotics Engineer", "AI Systems Developer", "Automation Specialist", "Research Scientist", "Startup Founder"]},
            {"program_type": "diploma", "name": "Diploma in Robotics & Automation", "description": "Practical, industry-focused diploma covering core robotics, automation, and embedded systems. Perfect for polytechnic students and working professionals.", "duration": "2 Years", "semesters": 4, "total_seats": 30, "year1_fee": 120000, "year2_fee": 110000, "year3_fee": 0, "year4_fee": 0, "eligibility": "10+2 or equivalent. Science background preferred.", "target_audience": "Polytechnic students, ITI graduates, working professionals.", "key_modules": ["Electronics Fundamentals", "Microcontroller Programming", "Robotic Systems", "Industrial Automation", "Project Work"], "learning_outcomes": ["Program microcontrollers for robotic control", "Design automated industrial systems", "Work with sensors and actuators"], "career_pathways": ["Robotics Technician", "Automation Operator", "Industrial Robot Programmer"]},
            {"program_type": "partner_diploma", "name": "Partner Diploma in Robotic AI Systems", "description": "Collaborative diploma with partner institutions. Revenue-sharing model enabling universities to launch premium robotics programs with InnovateR's curriculum, lab support, and faculty training.", "duration": "2 Years", "semesters": 4, "total_seats": 40, "year1_fee": 150000, "year2_fee": 140000, "year3_fee": 0, "year4_fee": 0, "eligibility": "10+2 with any stream. Technology aptitude required.", "target_audience": "Students at partner institutions, professionals seeking certification.", "key_modules": ["Robotics Foundations", "AI for Robotics", "Practical Lab Work", "Industry Projects", "Research Methodology"], "learning_outcomes": ["Apply AI to robotic systems", "Execute industry-standard robotics projects", "Utilize digital fabrication tools"], "career_pathways": ["Robotics Consultant", "AI Applications Engineer", "Product Developer"]},
        ])

    if await db.finance.count_documents({}) == 0:
        btech_opex = [
            {"name": "Assistant Professor (x2)", "amount": 1200000, "category": "Faculty"},
            {"name": "Associate Professor (x1)", "amount": 800000, "category": "Faculty"},
            {"name": "HoD / Lab Coordinator", "amount": 700000, "category": "Faculty"},
            {"name": "Lab Technician / Demonstrator (x2)", "amount": 600000, "category": "Support Staff"},
            {"name": "Library & Digital Resources", "amount": 200000, "category": "Academic Resources"},
            {"name": "Student Welfare & Co-curriculars", "amount": 150000, "category": "Student Support"},
            {"name": "Academic Administration", "amount": 200000, "category": "Operations"},
            {"name": "Examination & Evaluation", "amount": 100000, "category": "Operations"},
            {"name": "Utilities & Academic Operations", "amount": 200000, "category": "Operations"},
            {"name": "Software Licenses & Renewals", "amount": 150000, "category": "Technology"},
            {"name": "Marketing & Admissions", "amount": 200000, "category": "Marketing"},
            {"name": "Miscellaneous Academic Support", "amount": 300000, "category": "Miscellaneous"},
        ]
        diploma_opex = [
            {"name": "Faculty (x2)", "amount": 1000000, "category": "Faculty"},
            {"name": "Lab Instructor", "amount": 480000, "category": "Support Staff"},
            {"name": "Academic Administration", "amount": 120000, "category": "Operations"},
            {"name": "Lab Consumables & Maintenance", "amount": 150000, "category": "Operations"},
            {"name": "Utilities & Operations", "amount": 100000, "category": "Operations"},
            {"name": "Marketing & Admissions", "amount": 100000, "category": "Marketing"},
            {"name": "Miscellaneous", "amount": 150000, "category": "Miscellaneous"},
        ]
        await db.finance.insert_many([
            {"program_type": "btech", "total_seats": 60, "conversion_rate": 100, "year1_fee": 240550, "year2_fee": 229550, "year3_fee": 229550, "year4_fee": 229550, "scholarship_pct": 0, "university_share": 60, "robokoshal_share": 40, "partner_share": 0, "growth_rate": 10, "opex_items": btech_opex},
            {"program_type": "diploma", "total_seats": 30, "conversion_rate": 80, "year1_fee": 120000, "year2_fee": 110000, "year3_fee": 0, "year4_fee": 0, "scholarship_pct": 5, "university_share": 55, "robokoshal_share": 45, "partner_share": 0, "growth_rate": 10, "opex_items": diploma_opex},
            {"program_type": "partner_diploma", "total_seats": 40, "conversion_rate": 75, "year1_fee": 150000, "year2_fee": 140000, "year3_fee": 0, "year4_fee": 0, "scholarship_pct": 0, "university_share": 50, "robokoshal_share": 30, "partner_share": 20, "growth_rate": 10, "opex_items": diploma_opex},
        ])

    if await db.lab_items.count_documents({}) == 0:
        await db.lab_items.insert_many([
            {"category": "Civil Work & Interiors", "name": "Flooring & Paint (900 sq ft)", "quantity": 1, "unit_price": 200000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "Epoxy flooring + lab paint", "order": 1},
            {"category": "Civil Work & Interiors", "name": "LED Lighting & Electrical", "quantity": 1, "unit_price": 150000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "Full lab lighting", "order": 2},
            {"category": "Civil Work & Interiors", "name": "Premium Branding & Wall Graphics", "quantity": 1, "unit_price": 80000, "necessity": "optional", "preset": "flagship", "is_recurring": False, "comments": "InnovateR branding", "order": 3},
            {"category": "Furniture & Storage", "name": "Workbenches (Heavy Duty)", "quantity": 10, "unit_price": 15000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "Lab-grade steel workbenches", "order": 1},
            {"category": "Furniture & Storage", "name": "Student Chairs", "quantity": 30, "unit_price": 3000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "Ergonomic lab chairs", "order": 2},
            {"category": "Furniture & Storage", "name": "Storage Racks & Cabinets", "quantity": 6, "unit_price": 8000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "For components and kits", "order": 3},
            {"category": "Electrical & Power Backup", "name": "Electrical Wiring & Sockets", "quantity": 1, "unit_price": 80000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "Per workstation power", "order": 1},
            {"category": "Electrical & Power Backup", "name": "UPS System (5KVA)", "quantity": 1, "unit_price": 60000, "necessity": "must-have", "preset": "recommended", "is_recurring": False, "comments": "Power backup", "order": 2},
            {"category": "Electrical & Power Backup", "name": "Generator / DG Set", "quantity": 1, "unit_price": 200000, "necessity": "optional", "preset": "flagship", "is_recurring": False, "comments": "Full backup", "order": 3},
            {"category": "Networking & Surveillance", "name": "Wi-Fi 6 Access Points", "quantity": 3, "unit_price": 8000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "High-speed WiFi", "order": 1},
            {"category": "Networking & Surveillance", "name": "CCTV Security System", "quantity": 1, "unit_price": 35000, "necessity": "recommended", "preset": "recommended", "is_recurring": False, "comments": "4-camera system", "order": 2},
            {"category": "Computers & Displays", "name": "Desktop PCs (i7, 16GB RAM)", "quantity": 15, "unit_price": 45000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "For coding and simulation", "order": 1},
            {"category": "Computers & Displays", "name": "86-inch Smart Display / Interactive Board", "quantity": 1, "unit_price": 120000, "necessity": "must-have", "preset": "recommended", "is_recurring": False, "comments": "Primary teaching display", "order": 2},
            {"category": "Computers & Displays", "name": "GPU Workstations for AI/ML", "quantity": 2, "unit_price": 150000, "necessity": "optional", "preset": "flagship", "is_recurring": False, "comments": "RTX 4090 workstations", "order": 3},
            {"category": "3D Printers & Fabrication", "name": "FDM 3D Printers (Bambu/Creality)", "quantity": 5, "unit_price": 25000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "Bambu P1S or equivalent", "order": 1},
            {"category": "3D Printers & Fabrication", "name": "Resin 3D Printer", "quantity": 1, "unit_price": 40000, "necessity": "optional", "preset": "recommended", "is_recurring": False, "comments": "High-detail precision parts", "order": 2},
            {"category": "3D Printers & Fabrication", "name": "PLA/ABS/PETG Filament Stock", "quantity": 50, "unit_price": 1600, "necessity": "must-have", "preset": "lean", "is_recurring": True, "comments": "Annual recurring consumable", "order": 3},
            {"category": "Software Licenses", "name": "SOLIDWORKS / Fusion 360 EDU", "quantity": 15, "unit_price": 5000, "necessity": "must-have", "preset": "recommended", "is_recurring": True, "comments": "Annual CAD license", "order": 1},
            {"category": "Software Licenses", "name": "MATLAB / Simulink EDU", "quantity": 10, "unit_price": 8000, "necessity": "optional", "preset": "flagship", "is_recurring": True, "comments": "Control systems simulation", "order": 2},
            {"category": "Electronics Hardware", "name": "Arduino Uno Starter Kits", "quantity": 30, "unit_price": 2000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "One per student pair", "order": 1},
            {"category": "Electronics Hardware", "name": "Raspberry Pi 4 Kits (4GB)", "quantity": 15, "unit_price": 6000, "necessity": "must-have", "preset": "recommended", "is_recurring": False, "comments": "For advanced projects", "order": 2},
            {"category": "Electronics Hardware", "name": "Sensors & Actuators Kit", "quantity": 15, "unit_price": 3000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "Ultrasonic, IR, servo, motor", "order": 3},
            {"category": "Robot Platforms", "name": "Mobile Robot Platform (ROS)", "quantity": 5, "unit_price": 120000, "necessity": "must-have", "preset": "recommended", "is_recurring": False, "comments": "ROS-compatible mobile robot", "order": 1},
            {"category": "Robot Platforms", "name": "6-DOF Robotic Arm Trainer", "quantity": 3, "unit_price": 150000, "necessity": "must-have", "preset": "recommended", "is_recurring": False, "comments": "Educational robotic arm", "order": 2},
            {"category": "Robot Platforms", "name": "Unitree Go2 EDU (Quadruped Dog)", "quantity": 1, "unit_price": 1600000, "necessity": "optional", "preset": "flagship", "is_recurring": False, "comments": "Industry-grade robot dog", "order": 3},
            {"category": "Tools & Safety", "name": "Electronics Tool Kit", "quantity": 10, "unit_price": 5000, "necessity": "must-have", "preset": "lean", "is_recurring": False, "comments": "Soldering, multimeter, pliers", "order": 1},
            {"category": "Tools & Safety", "name": "Safety Equipment (Goggles, Gloves)", "quantity": 30, "unit_price": 500, "necessity": "must-have", "preset": "lean", "is_recurring": True, "comments": "Annual replacement", "order": 2},
        ])

    if await db.testimonials.count_documents({}) == 0:
        await db.testimonials.insert_many([
            {"author": "Dr. Rajesh Kumar", "role": "Dean of Engineering", "organization": "COER University", "quote": "Robokoshal's InnovateR platform represents exactly what modern technical education needs. The curriculum depth and lab setup quality exceeded our expectations entirely.", "avatar_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop", "order": 1},
            {"author": "Prof. Anita Sharma", "role": "Head of Department, CS", "organization": "Partner Institution", "quote": "The robotics curriculum designed by InnovateR bridges the gap between theory and practice perfectly. Our students are industry-ready from day one.", "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b993?w=150&h=150&fit=crop", "order": 2},
            {"author": "Rahul Verma", "role": "B.Tech Student, 2023 Batch", "organization": "COER University", "quote": "Building a spider robot in my second year was something I never imagined possible at university. InnovateR makes extraordinary things happen.", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop", "order": 3},
        ])

    # Write test credentials
    try:
        Path("/app/memory").mkdir(exist_ok=True)
        with open("/app/memory/test_credentials.md", "w") as f:
            f.write(f"""# Test Credentials\n\n## Super Admin\n- Email: {ADMIN_EMAIL}\n- Password: {ADMIN_PASSWORD}\n- Role: super_admin\n\n## API Base\n- Backend: http://localhost:8001/api\n\n## Key Endpoints\n- POST /api/auth/login\n- GET /api/auth/me\n- POST /api/auth/register (admin only)\n- GET /api/team\n- GET /api/portfolio\n- GET /api/programs\n- GET /api/finance/{{program_type}}\n- GET /api/lab-planner\n- GET /api/testimonials\n""")
    except Exception as e:
        logger.error(f"Could not write credentials: {e}")

@app.on_event("shutdown")
async def shutdown():
    client.close()
