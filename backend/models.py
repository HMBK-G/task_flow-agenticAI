from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    notify_email = Column(Boolean, default=True)
    notify_sms = Column(Boolean, default=False)
    
    tasks = relationship("Task", back_populates="assignee")
    events = relationship("Event", back_populates="assignee")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(String, default="Pending") # Pending, In Progress, Completed
    deadline = Column(String)
    priority = Column(String, default="Medium")
    category = Column(String, default="General")
    member_id = Column(Integer, ForeignKey("members.id"))

    assignee = relationship("Member", back_populates="tasks")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    date = Column(String)
    status = Column(String, default="Upcoming") # Upcoming, Passed
    member_id = Column(Integer, ForeignKey("members.id"))

    assignee = relationship("Member", back_populates="events")
