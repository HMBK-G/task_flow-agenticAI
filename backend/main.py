from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
from groq import Groq
from openai import OpenAI
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from twilio.rest import Client as TwilioClient
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import resend

from . import models, database
from .database import engine, get_db

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

def seed_db():
    db = next(get_db())
    if db.query(models.Member).count() == 0:
        member1 = models.Member(name="LATHA", email="ynglatha@gmail.com", phone="+1234567890")
        member2 = models.Member(name="Hmbk", email="hmbkganta@gmail.com", phone="+0987654321")
        db.add(member1)
        db.add(member2)
        db.commit()
        
        task1 = models.Task(title="Initial Assessment", description="Welcome task", deadline="2026-12-31", member_id=1, status="Pending", priority="Medium", category="General")
        db.add(task1)
        db.commit()

seed_db()

app = FastAPI(title="Agentic AI Club Workflow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM = os.getenv("MAIL_FROM", "noreply@taskflow.com"),
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "TaskFlow"),
    MAIL_STARTTLS = os.getenv("MAIL_STARTTLS", "True") == "True",
    MAIL_SSL_TLS = os.getenv("MAIL_SSL_TLS", "False") == "True",
    USE_CREDENTIALS = os.getenv("USE_CREDENTIALS", "True") == "True",
    VALIDATE_CERTS = os.getenv("VALIDATE_CERTS", "True") == "True"
)

# --- Pydantic Models ---
class TaskBase(BaseModel):
    title: str
    description: str
    deadline: str
    priority: str = "Medium"
    category: str = "General"
    member_name: str
    email: Optional[str] = None
    phone: Optional[str] = None

class TaskUpdate(BaseModel):
    status: str

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    deadline: str
    priority: str
    category: str
    member_name: str
    
class MemberResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    initials: str
    tasks_count: int
    tasks_total: int
    role: str = "Member"

    class Config:
        from_attributes = True

class AIRequest(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    messages: Optional[list] = None

class AISettings(BaseModel):
    openai_key: Optional[str] = ""
    groq_key: Optional[str] = ""

# --- Notification Logic ---
async def send_notifications(member_name: str, task_title: str, deadline: str, email: str = None, phone: str = None):
    message_text = f"Hello {member_name}, you have been assigned a task: {task_title}. Deadline: {deadline}."
    
    # Email
    resend_key = os.getenv("RESEND_API_KEY")
    if email:
        if resend_key:
            try:
                resend.api_key = resend_key
                resend.Emails.send({
                    "from": "onboarding@resend.dev",
                    "to": email,
                    "subject": f"New Task Assigned: {task_title}",
                    "html": f"<strong>Hi {member_name},</strong><br><br>You have been assigned a new task: <strong>{task_title}</strong>.<br>Deadline: {deadline}<br><br>Check TaskFlow for details."
                })
                print(f"Email sent via Resend to {email}")
            except Exception as e:
                print(f"Resend error: {e}")
        elif conf.MAIL_USERNAME:
            message = MessageSchema(
                subject="New Task Assigned",
                recipients=[email],
                body=message_text,
                subtype=MessageType.plain
            )
            fm = FastMail(conf)
            try:
                await fm.send_message(message)
                print(f"Email sent via SMTP to {email}")
            except Exception as e:
                print(f"SMTP error: {e}")
        else:
            print("No Email API or SMTP configured. Skipping email.")

    # SMS (Twilio)
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")
    
    if phone and all([account_sid, auth_token, from_number]):
        try:
            client = TwilioClient(account_sid, auth_token)
            client.messages.create(body=message_text, from_=from_number, to=phone)
            print(f"SMS sent to {phone}")
        except Exception as e:
            print(f"SMS error: {e}")

# --- API Endpoints ---

@app.post("/api/assign-task")
async def assign_task(task_data: TaskBase, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not task_data.email and not task_data.phone:
        raise HTTPException(status_code=400, detail="At least email or phone is required")

    # Check if member exists
    member = None
    if task_data.email:
        member = db.query(models.Member).filter(models.Member.email == task_data.email).first()
    if not member and task_data.phone:
        member = db.query(models.Member).filter(models.Member.phone == task_data.phone).first()

    # Create member if not exists
    if not member:
        member = models.Member(
            name=task_data.member_name,
            email=task_data.email,
            phone=task_data.phone
        )
        db.add(member)
        db.commit()
        db.refresh(member)

    # Create task
    new_task = models.Task(
        title=task_data.title,
        description=task_data.description,
        deadline=task_data.deadline,
        priority=task_data.priority,
        category=task_data.category,
        member_id=member.id,
        status="Pending"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Trigger real notification
    background_tasks.add_task(send_notifications, member.name, new_task.title, new_task.deadline, member.email, member.phone)
    print(f"DEBUG: Triggered notification for {member.name} on task {new_task.title}")

    return {"message": "Task assigned successfully", "task_id": new_task.id}

@app.get("/api/dashboard")
async def get_dashboard_data(db: Session = Depends(get_db)):
    total_tasks = db.query(models.Task).count()
    completed_tasks = db.query(models.Task).filter(models.Task.status == "Completed").count()
    in_progress = db.query(models.Task).filter(models.Task.status == "In Progress").count()
    urgent = db.query(models.Task).filter(models.Task.priority == "High").count()
    members_count = db.query(models.Member).count()
    
    recent_tasks = db.query(models.Task).order_by(models.Task.id.desc()).limit(4).all()
    members = db.query(models.Member).all()
    
    return {
        "stats": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress": in_progress,
            "urgent": urgent,
            "members_count": members_count,
            "events_count": 0 # Placeholder for now
        },
        "recent_tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "status": t.status,
                "deadline": t.deadline,
                "priority": t.priority,
                "category": t.category,
                "member_name": t.assignee.name
            } for t in recent_tasks
        ],
        "member_activity": [
            {
                "id": m.id,
                "name": m.name,
                "initials": m.name[0].upper() if m.name else "?",
                "tasks_count": len([t for t in m.tasks if t.status != "Completed"]),
                "tasks_total": len(m.tasks)
            } for m in members
        ],
        "upcoming_events": []
    }

@app.get("/api/members", response_model=List[MemberResponse])
def get_members(db: Session = Depends(get_db)):
    members = db.query(models.Member).all()
    response = []
    for m in members:
        response.append({
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "phone": m.phone,
            "initials": m.name[0].upper() if m.name else "?",
            "tasks_count": len([t for t in m.tasks if t.status == "Completed"]),
            "tasks_total": len(m.tasks),
            "role": "Member" # You might want to add this to the model later
        })
    return response

@app.put("/api/members/{member_id}")
def update_member(member_id: int, update: dict, db: Session = Depends(get_db)):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    for key, value in update.items():
        if hasattr(member, key):
            setattr(member, key, value)
    db.commit()
    return {"message": "Member updated"}

@app.delete("/api/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": "Member deleted"}

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()
    # Manually map member_name
    response = []
    for t in tasks:
        response.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "deadline": t.deadline,
            "priority": t.priority,
            "category": t.category,
            "member_name": t.assignee.name
        })
    return response

@app.put("/api/tasks/{task_id}")
def update_task_status(task_id: int, update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = update.status
    db.commit()
    return {"message": "Status updated"}

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

# --- Agentic AI Features ---

@app.get("/api/settings", response_model=AISettings)
async def get_settings():
    return AISettings(
        openai_key=os.getenv("OPENAI_API_KEY", ""),
        groq_key=os.getenv("GROQ_API_KEY", "")
    )

@app.post("/api/settings")
async def update_settings(settings: AISettings):
    # For a simple local app, we update the environment variables
    # In a real app, you'd save this to a DB
    os.environ["OPENAI_API_KEY"] = settings.openai_key
    os.environ["GROQ_API_KEY"] = settings.groq_key
    return {"detail": "Settings updated"}

@app.post("/api/ai/suggest")
async def ai_suggest(req: AIRequest):
    openai_key = os.getenv("OPENAI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    
    prompt = f"Task Title: {req.title}\nDescription: {req.description}\n\nSuggest a priority (Low, Medium, High), a reminder message, and an expanded description. Return as JSON: {{\"priority\": \"...\", \"reminder\": \"...\", \"expanded_description\": \"...\"}}"
    
    try:
        if groq_key:
            client = Groq(api_key=groq_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return completion.choices[0].message.content
        elif openai_key:
            client = OpenAI(api_key=openai_key)
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" }
            )
            return completion.choices[0].message.content
        else:
            return {"error": "No AI API key found"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/ai/process")
async def process_ai(query: AIRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    import json
    import re
    
    openai_key = os.getenv("OPENAI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    
    if not query.messages:
        return {"result": "No messages provided"}

    # Context for the AI
    members = db.query(models.Member).all()
    tasks = db.query(models.Task).all()
    
    member_context = [{"id": m.id, "name": m.name, "email": m.email} for m in members]
    task_context = [{"id": t.id, "title": t.title, "assignee": t.assignee.name} for t in tasks]

    system_prompt = (
        f"You are TaskFlow AI, an agentic club management assistant. "
        f"Current state: {len(tasks)} tasks, {len(members)} members. "
        f"Members: {json.dumps(member_context)}. "
        f"Tasks: {json.dumps(task_context)}. "
        "\n\nIf the user wants to perform an action, you MUST include a structured action tag. "
        "Formats:\n"
        "1. Add member: [ACTION: {\"type\": \"add_member\", \"name\": \"Full Name\", \"email\": \"email@ex.com\", \"phone\": \"+123\"}]\n"
        "2. Add task: [ACTION: {\"type\": \"add_task\", \"title\": \"Title\", \"member_name\": \"Name\", \"deadline\": \"YYYY-MM-DD\"}]\n"
        "3. Delete task: [ACTION: {\"type\": \"delete_task\", \"task_id\": 123}]\n"
        "4. Send notification: [ACTION: {\"type\": \"send_notification\", \"member_name\": \"Name\", \"message\": \"Your message here\"}]\n"
        "\nIMPORTANT: Be extremely concise. DO NOT show internal IDs or full lists to the user unless they ask. "
        "You have real email/SMS capabilities. When you add a task, tell the user: 'Task assigned and notification sent to [Name].'"
    )

    messages = [{"role": "system", "content": system_prompt}] + query.messages

    response_text = ""
    try:
        if groq_key:
            client = Groq(api_key=groq_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages
            )
            response_text = completion.choices[0].message.content
        elif openai_key:
            client = OpenAI(api_key=openai_key)
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages
            )
            response_text = completion.choices[0].message.content
        else:
            return {"result": "No API key found. Please add your Groq or OpenAI key in Settings!"}
    except Exception as e:
        return {"result": f"Error: {str(e)}"}

    # Parse Agentic Actions
    action_match = re.search(r'\[ACTION:\s*({.*?})\]', response_text)
    if action_match:
        try:
            action_data = json.loads(action_match.group(1))
            a_type = action_data.get("type")
            
            if a_type == "add_member":
                # Check if we have enough info
                if not action_data.get("email") and not action_data.get("phone"):
                    response_text = "I'd love to add " + action_data.get("name") + ", but I need an email or phone number to notify them. Could you provide one?"
                else:
                    new_member = models.Member(
                        name=action_data["name"],
                        email=action_data.get("email"),
                        phone=action_data.get("phone")
                    )
                    db.add(new_member)
                    db.commit()
                    response_text = response_text.replace(action_match.group(0), "").strip()
                    if not response_text: response_text = f"✅ Added {new_member.name} to the club."

            elif a_type == "add_task":
                # Find member
                member_name = action_data.get("member_name")
                member = db.query(models.Member).filter(models.Member.name == member_name).first()
                if not member:
                    response_text = f"I can't find a member named '{member_name}'. Should I create them first? If so, please provide their email."
                else:
                    new_task = models.Task(
                        title=action_data["title"],
                        description=action_data.get("description", ""),
                        deadline=action_data.get("deadline", "2026-12-31"),
                        member_id=member.id,
                        status="Pending"
                    )
                    db.add(new_task)
                    db.commit()
                    db.refresh(new_task)
                    
                    # Trigger real notification
                    background_tasks.add_task(send_notifications, member.name, new_task.title, new_task.deadline, member.email, member.phone)
                    
                    response_text = response_text.replace(action_match.group(0), "").strip()
                    if not response_text: response_text = f"✅ Created task '{new_task.title}' for {member.name} and sent a real notification."

            elif a_type == "delete_task":
                task_id = action_data.get("task_id")
                task = db.query(models.Task).filter(models.Task.id == task_id).first()
                if task:
                    title = task.title
                    db.delete(task)
                    db.commit()
                    response_text = response_text.replace(action_match.group(0), "").strip()
                    if not response_text: response_text = f"✅ Deleted task '{title}'."
                else:
                    response_text = "I couldn't find that task to delete."

            elif a_type == "send_notification":
                member_name = action_data.get("member_name")
                member = db.query(models.Member).filter(models.Member.name == member_name).first()
                if member:
                    background_tasks.add_task(send_notifications, member.name, "General Notification", "None", member.email, member.phone)
                    response_text = response_text.replace(action_match.group(0), "").strip()
                    if not response_text: response_text = f"✅ Notification sent to {member.name}."
                else:
                    response_text = f"I couldn't find a member named '{member_name}' to notify."

        except Exception as e:
            print(f"Action error: {e}")

    return {"result": response_text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
