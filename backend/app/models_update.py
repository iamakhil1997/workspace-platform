
class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=True) # e.g. 'Laptop', 'Monitor'
    serial_number = Column(String, unique=True, nullable=True)
    status = Column(String, default="available") # available, assigned, maintenance, retired
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to = relationship("User", backref="assets")

class Training(Base):
    __tablename__ = "learnings" # 'training' might be reserved or conflicts
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="assigned") # assigned, in_progress, completed
    assigned_to_id = Column(Integer, ForeignKey("users.id"))
    due_date = Column(DateTime, nullable=True)
    completion_date = Column(DateTime, nullable=True)
    assigned_to = relationship("User", backref="trainings")

class ExitRequest(Base):
    __tablename__ = "exit_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    reason = Column(Text, nullable=True)
    status = Column(String, default="pending") # pending, approved, rejected, completed
    requested_date = Column(DateTime, default=datetime.utcnow)
    last_working_day = Column(DateTime, nullable=True)
    employee = relationship("User", backref="exit_requests")
