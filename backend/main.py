from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import os
from groq import Groq
from openai import OpenAI

app = FastAPI(title="TaskFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Member(BaseModel):
    id: str
    name: str
    role: str
    initials: str
    email: str = "no-email@example.com"
    tasks_count: int = 0
    tasks_total: int = 3

class MemberCreate(BaseModel):
    name: str
    role: str
    email: str = "no-email@example.com"

class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    assignee_id: str
    assignee_name: str
    priority: str
    status: str
    category: Optional[str] = ""
    due_date: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    assignee_id: str
    priority: str
    status: str
    category: Optional[str] = ""
    due_date: str

class Event(BaseModel):
    id: str
    name: str
    date: str
    member_name: Optional[str] = "Unassigned"

class EventCreate(BaseModel):
    name: str
    date: str
    member_name: Optional[str] = "Unassigned"

class AISettings(BaseModel):
    openai_key: Optional[str] = ""
    groq_key: Optional[str] = ""

# In-memory database
db_members = [
    Member(id="1", name="LATHA", role="Member", initials="L", email="latha@example.com", tasks_count=2, tasks_total=3),
    Member(id="2", name="Karthikeyani", role="Member", initials="K", email="karthikeyani@example.com", tasks_count=1, tasks_total=3),
    Member(id="3", name="Geeta", role="Member", initials="G", email="geeta@example.com", tasks_count=1, tasks_total=3),
    Member(id="4", name="Raja", role="Member", initials="R", email="raja@example.com", tasks_count=0, tasks_total=3),
]

db_tasks = [
    Task(id="t1", title="Ad Assessment Work", description="Assessment work related to the Kartika inning.", assignee_id="2", assignee_name="Karthikeyani", priority="Medium", status="To Do", category="", due_date="Apr 30"),
    Task(id="t2", title="AI homework", description="Complete the assigned AI homework.", assignee_id="1", assignee_name="LATHA", priority="Medium", status="To Do", category="development", due_date="Apr 30"),
    Task(id="t3", title="Time Table Scheduler", description="Create a schedule for managing time tables effectively.", assignee_id="3", assignee_name="Geeta", priority="Medium", status="To Do", category="development", due_date="Apr 30"),
    Task(id="t4", title="Cast to Raja", description="", assignee_id="1", assignee_name="LATHA", priority="Medium", status="To Do", category="development", due_date="Apr 30"),
]

db_events = [
    Event(id="e1", name="Agent", date="Apr 24, 2026"),
]

db_settings = AISettings()

# API Endpoints
@app.get("/api/dashboard")
async def get_dashboard_data():
    return {
        "stats": {
            "total_tasks": len(db_tasks),
            "completed_tasks": len([t for t in db_tasks if t.status == "Completed"]),
            "in_progress": len([t for t in db_tasks if t.status == "In Progress"]),
            "urgent": len([t for t in db_tasks if t.priority == "High"]),
            "members_count": len(db_members),
            "events_count": len(db_events)
        },
        "recent_tasks": db_tasks,
        "member_activity": db_members,
        "upcoming_events": db_events
    }

@app.get("/api/tasks", response_model=List[Task])
async def get_tasks():
    return db_tasks

@app.post("/api/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    assignee = next((m for m in db_members if m.id == task.assignee_id), None)
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")
    
    new_task = Task(
        id=str(uuid.uuid4()),
        **task.model_dump(),
        assignee_name=assignee.name
    )
    db_tasks.append(new_task)
    assignee.tasks_count += 1
    return new_task

@app.put("/api/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: dict):
    task = next((t for t in db_tasks if t.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in task_update.items():
        if hasattr(task, key):
            setattr(task, key, value)
    
    return task

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    global db_tasks
    task = next((t for t in db_tasks if t.id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_tasks = [t for t in db_tasks if t.id != task_id]
    assignee = next((m for m in db_members if m.id == task.assignee_id), None)
    if assignee:
        assignee.tasks_count = max(0, assignee.tasks_count - 1)
    return {"detail": "Task deleted"}

@app.get("/api/members", response_model=List[Member])
async def get_members():
    return db_members

@app.post("/api/members", response_model=Member)
async def create_member(member: MemberCreate):
    new_member = Member(
        id=str(uuid.uuid4()),
        name=member.name,
        role=member.role,
        email=member.email,
        initials=member.name[0].upper() if member.name else "?",
        tasks_count=0,
        tasks_total=0
    )
    db_members.append(new_member)
    return new_member

@app.put("/api/members/{member_id}", response_model=Member)
async def update_member(member_id: str, updates: dict):
    member = next((m for m in db_members if m.id == member_id), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    for key, value in updates.items():
        if hasattr(member, key):
            setattr(member, key, value)
    # Recompute initials if name changed
    if 'name' in updates and updates['name']:
        member.initials = updates['name'][0].upper()
    return member

@app.delete("/api/members/{member_id}")
async def delete_member(member_id: str):
    global db_members
    member = next((m for m in db_members if m.id == member_id), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db_members = [m for m in db_members if m.id != member_id]
    return {"detail": "Member deleted"}

@app.get("/api/events", response_model=List[Event])
async def get_events():
    return db_events

@app.post("/api/events", response_model=Event)
async def create_event(event: EventCreate):
    new_event = Event(
        id=str(uuid.uuid4()),
        **event.model_dump()
    )
    db_events.append(new_event)
    return new_event

@app.get("/api/settings", response_model=AISettings)
async def get_settings():
    return db_settings

@app.post("/api/settings")
async def update_settings(settings: AISettings):
    global db_settings
    db_settings = settings
    return {"detail": "Settings updated"}

class AIRequest(BaseModel):
    messages: list

@app.post("/api/ai/process")
async def process_ai(query: AIRequest):
    global db_members, db_tasks
    history = query.messages
    import json
    import re

    # Provide context about current state for the LLM
    member_context = [{"id": m.id, "name": m.name} for m in db_members]
    task_context = [{"id": t.id, "title": t.title, "assignee": t.assignee_name} for t in db_tasks]
    
    system_prompt = (
        f"You are TaskFlow AI, an agentic club management assistant. "
        f"Current state: {len(db_tasks)} tasks, {len(db_members)} members. "
        f"Available Members: {json.dumps(member_context)}. "
        f"Current Tasks: {json.dumps(task_context)}. "
        "\n\nIf the user wants to perform an action, you MUST include a structured action tag in your response. "
        "Formats:\n"
        "1. Add member: [ACTION: {\"type\": \"add_member\", \"name\": \"Full Name\", \"role\": \"Role\"}]\n"
        "2. Add task: [ACTION: {\"type\": \"add_task\", \"title\": \"Task Title\", \"assignee_id\": \"member_id\", \"priority\": \"Low/Medium/High\"}]\n"
        "3. Delete member: [ACTION: {\"type\": \"delete_member\", \"member_id\": \"member_id\"}]\n"
        "4. Delete task: [ACTION: {\"type\": \"delete_task\", \"task_id\": \"task_id\"}]\n\n"
        "IMPORTANT: When adding a task, if the user doesn't mention priority, you MUST ask them what priority it should be (Low, Medium, or High). "
        "For now, if you proceed with an action without asking, default to 'Medium' in the JSON, but explicitly mention in your reply that you've set it to Medium and they can change it."
        "\n\nBe intelligent: find the correct IDs from the lists above. If the user says 'remove Alex', find the ID for Alex."
    )

    messages_for_llm = [{"role": "system", "content": system_prompt}] + history

    response_text = ""
    if db_settings.groq_key:
        try:
            client = Groq(api_key=db_settings.groq_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages_for_llm
            )
            response_text = completion.choices[0].message.content
        except Exception as e:
            return {"result": f"Error with Groq: {str(e)}"}
    elif db_settings.openai_key:
        try:
            client = OpenAI(api_key=db_settings.openai_key)
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages_for_llm
            )
            response_text = completion.choices[0].message.content
        except Exception as e:
            return {"result": f"Error with OpenAI: {str(e)}"}
    else:
        return {"result": "No API key found. Please add your Groq or OpenAI key in Settings!"}

    # Parse Agentic Actions from LLM response
    action_match = re.search(r'\[ACTION:\s*({.*?})\]', response_text)
    if action_match:
        try:
            action_data = json.loads(action_match.group(1))
            a_type = action_data.get("type")
            
            if a_type == "add_member":
                name = action_data["name"].title()
                new_member = Member(
                    id=str(uuid.uuid4()),
                    name=name,
                    role=action_data.get("role", "Member"),
                    email=f"{name.lower().replace(' ', '')}@example.com",
                    initials=name[0].upper() if name else "?",
                    tasks_count=0,
                    tasks_total=0
                )
                db_members.append(new_member)
                response_text = response_text.replace(action_match.group(0), "").strip()
                if len(response_text) < 10: response_text = f"✅ Added {name} to the club."

            elif a_type == "add_task":
                title = action_data["title"]
                assignee_id = action_data.get("assignee_id")
                priority = action_data.get("priority", "Medium")
                assignee = next((m for m in db_members if m.id == assignee_id), None)
                new_task = Task(
                    id=str(uuid.uuid4()),
                    title=title,
                    description="",
                    assignee_id=assignee.id if assignee else "0",
                    assignee_name=assignee.name if assignee else "Unassigned",
                    priority=priority,
                    status="To Do",
                    category="AI Generated",
                    due_date="TBD"
                )
                db_tasks.append(new_task)
                if assignee: assignee.tasks_count += 1
                response_text = response_text.replace(action_match.group(0), "").strip()
                if len(response_text) < 10: response_text = f"✅ Created task '{title}'."

            elif a_type == "delete_member":
                m_id = action_data.get("member_id")
                member = next((m for m in db_members if m.id == m_id), None)
                if member:
                    db_members = [m for m in db_members if m.id != m_id]
                    response_text = response_text.replace(action_match.group(0), "").strip()
                    if len(response_text) < 10: response_text = f"🗑️ Removed {member.name} from the club."
            
            elif a_type == "delete_task":
                t_id = action_data.get("task_id")
                task = next((t for t in db_tasks if t.id == t_id), None)
                if task:
                    db_tasks = [t for t in db_tasks if t.id != t_id]
                    response_text = response_text.replace(action_match.group(0), "").strip()
                    if len(response_text) < 10: response_text = f"🗑️ Deleted task '{task.title}'."

        except Exception as e:
            print(f"Action parsing error: {e}")

    return {"result": response_text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
