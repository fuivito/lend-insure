from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Enum, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class BrokerRoleEnum(str, enum.Enum):
    BROKER = "BROKER"
    BROKER_ADMIN = "BROKER_ADMIN"
    INTERNAL = "INTERNAL"

class AgreementStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    PROPOSED = "PROPOSED"
    SIGNED = "SIGNED"
    ACTIVE = "ACTIVE"
    DEFAULTED = "DEFAULTED"
    TERMINATED = "TERMINATED"

class InstalmentStatusEnum(str, enum.Enum):
    UPCOMING = "UPCOMING"
    PAID = "PAID"
    MISSED = "MISSED"

class PaymentStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class OrganisationStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    INACTIVE = "INACTIVE"

class ProposalStatusEnum(str, enum.Enum):
    NEW = "new"
    VIEWED = "viewed"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"

class Organisation(Base):
    __tablename__ = "organisations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    status = Column(Enum(OrganisationStatusEnum), default=OrganisationStatusEnum.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    broker_users = relationship("BrokerUser", back_populates="organisation", cascade="all, delete-orphan")
    clients = relationship("Client", back_populates="organisation", cascade="all, delete-orphan")
    policies = relationship("Policy", back_populates="organisation", cascade="all, delete-orphan")
    agreements = relationship("Agreement", back_populates="organisation", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organisation", cascade="all, delete-orphan")
    # proposals = relationship("Proposal", back_populates="organisation", cascade="all, delete-orphan")  # Table doesn't exist

class BrokerUser(Base):
    __tablename__ = "broker_users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    organisation_id = Column(String, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(BrokerRoleEnum), nullable=False)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    organisation = relationship("Organisation", back_populates="broker_users")
    
    __table_args__ = (Index('idx_broker_users_organisation_id', 'organisation_id'),)

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    organisation_id = Column(String, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    address_line1 = Column(String)
    address_line2 = Column(String)
    city = Column(String)
    postcode = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    organisation = relationship("Organisation", back_populates="clients")
    policies = relationship("Policy", back_populates="client", cascade="all, delete-orphan")
    agreements = relationship("Agreement", back_populates="client", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_clients_organisation_id', 'organisation_id'),
        Index('idx_clients_email', 'email'),
    )

class Policy(Base):
    __tablename__ = "policies"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    organisation_id = Column(String, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    client_id = Column(String, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    insurer_name = Column(String, nullable=False)
    product_type = Column(String, nullable=False)
    policy_number = Column(String, nullable=False)
    inception_date = Column(DateTime(timezone=True), nullable=False)
    expiry_date = Column(DateTime(timezone=True), nullable=False)
    gross_premium = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    organisation = relationship("Organisation", back_populates="policies")
    client = relationship("Client", back_populates="policies")
    agreements = relationship("Agreement", back_populates="policy", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_policies_organisation_id', 'organisation_id'),
        Index('idx_policies_client_id', 'client_id'),
    )

class Agreement(Base):
    __tablename__ = "agreements"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    organisation_id = Column(String, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    client_id = Column(String, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    policy_id = Column(String, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    principal_amount_pennies = Column(Integer, nullable=False)  # Amount in pennies
    apr_bps = Column(Integer, nullable=False)
    term_months = Column(Integer, nullable=False)
    broker_fee_bps = Column(Integer, nullable=False)
    status = Column(Enum(AgreementStatusEnum), default=AgreementStatusEnum.DRAFT)
    signed_at = Column(DateTime(timezone=True))
    activated_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    organisation = relationship("Organisation", back_populates="agreements")
    client = relationship("Client", back_populates="agreements")
    policy = relationship("Policy", back_populates="agreements")
    instalments = relationship("Instalment", back_populates="agreement", cascade="all, delete-orphan")
    # Commented out relationships for tables that don't exist
    # payments = relationship("Payment", back_populates="agreement", cascade="all, delete-orphan")
    # credit_checks = relationship("CreditCheck", back_populates="agreement", cascade="all, delete-orphan")
    # events = relationship("AgreementEvent", back_populates="agreement", cascade="all, delete-orphan")
    # documents = relationship("AgreementDocument", back_populates="agreement", cascade="all, delete-orphan")
    # commission_lines = relationship("CommissionLine", back_populates="agreement", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_agreements_organisation_id', 'organisation_id'),
        Index('idx_agreements_client_id', 'client_id'),
        Index('idx_agreements_status', 'status'),
    )

class Instalment(Base):
    __tablename__ = "instalments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    agreement_id = Column(String, ForeignKey("agreements.id", ondelete="CASCADE"), nullable=False)
    sequence = Column(Integer, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    amount_due = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), default=0)
    status = Column(Enum(InstalmentStatusEnum), default=InstalmentStatusEnum.UPCOMING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    agreement = relationship("Agreement", back_populates="instalments")
    # payments = relationship("Payment", back_populates="instalment")  # Table doesn't exist
    
    __table_args__ = (Index('idx_instalments_agreement_id', 'agreement_id'),)

# Payment model - table doesn't exist in current database
# class Payment(Base):
#     __tablename__ = "payments"
#     
#     id = Column(String, primary_key=True, default=generate_uuid)
#     agreement_id = Column(String, ForeignKey("agreements.id", ondelete="CASCADE"), nullable=False)
#     instalment_id = Column(String, ForeignKey("instalments.id", ondelete="SET NULL"))
#     amount = Column(Numeric(10, 2), nullable=False)
#     collected_at = Column(DateTime(timezone=True), server_default=func.now())
#     method = Column(String, nullable=False)
#     status = Column(Enum(PaymentStatusEnum), default=PaymentStatusEnum.COMPLETED)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())
#     
#     agreement = relationship("Agreement", back_populates="payments")
#     instalment = relationship("Instalment", back_populates="payments")
#     
#     __table_args__ = (Index('idx_payments_agreement_id', 'agreement_id'),)

# CreditCheck model - table doesn't exist in current database
# class CreditCheck(Base):
#     __tablename__ = "credit_checks"
#     
#     id = Column(String, primary_key=True, default=generate_uuid)
#     agreement_id = Column(String, ForeignKey("agreements.id", ondelete="CASCADE"), nullable=False)
#     provider = Column(String, nullable=False)
#     score = Column(Integer)
#     decision = Column(String, nullable=False)
#     payload = Column(JSON)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     
#     agreement = relationship("Agreement", back_populates="credit_checks")
#     
#     __table_args__ = (Index('idx_credit_checks_agreement_id', 'agreement_id'),)

# AgreementEvent model - table doesn't exist in current database
# class AgreementEvent(Base):
#     __tablename__ = "agreement_events"
#     
#     id = Column(String, primary_key=True, default=generate_uuid)
#     agreement_id = Column(String, ForeignKey("agreements.id", ondelete="CASCADE"), nullable=False)
#     type = Column(String, nullable=False)
#     actor_type = Column(String, nullable=False)
#     meta = Column(JSON)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     
#     agreement = relationship("Agreement", back_populates="events")
#     
#     __table_args__ = (Index('idx_agreement_events_agreement_id', 'agreement_id'),)

# AgreementDocument model - table doesn't exist in current database
# class AgreementDocument(Base):
#     __tablename__ = "agreement_documents"
#     
#     id = Column(String, primary_key=True, default=generate_uuid)
#     agreement_id = Column(String, ForeignKey("agreements.id", ondelete="CASCADE"), nullable=False)
#     kind = Column(String, nullable=False)
#     storage_key = Column(String, nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     
#     agreement = relationship("Agreement", back_populates="documents")
#     
#     __table_args__ = (Index('idx_agreement_documents_agreement_id', 'agreement_id'),)

# CommissionLine model - table doesn't exist in current database
# class CommissionLine(Base):
#     __tablename__ = "commission_lines"
#     
#     id = Column(String, primary_key=True, default=generate_uuid)
#     agreement_id = Column(String, ForeignKey("agreements.id", ondelete="CASCADE"), nullable=False)
#     type = Column(String, nullable=False)
#     amount = Column(Numeric(10, 2), nullable=False)
#     currency = Column(String, default="GBP")
#     calculated_at = Column(DateTime(timezone=True), server_default=func.now())
#     
#     agreement = relationship("Agreement", back_populates="commission_lines")
#     
#     __table_args__ = (Index('idx_commission_lines_agreement_id', 'agreement_id'),)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    organisation_id = Column(String, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    actor_type = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    before = Column(JSON)
    after = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    organisation = relationship("Organisation", back_populates="audit_logs")
    
    __table_args__ = (
        Index('idx_audit_logs_organisation_id', 'organisation_id'),
        Index('idx_audit_logs_created_at', 'created_at'),
    )

# Proposal model - table doesn't exist in current database
# class Proposal(Base):
#     __tablename__ = "proposals"
#     
#     id = Column(String, primary_key=True, default=generate_uuid)
#     organisation_id = Column(String, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
#     client_id = Column(String, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
#     broker_id = Column(String, ForeignKey("broker_users.id", ondelete="CASCADE"), nullable=False)
#     broker_name = Column(String, nullable=False)
#     broker_email = Column(String, nullable=False)
#     insurance_type = Column(String, nullable=False)
#     total_premium = Column(Numeric(10, 2), nullable=False)
#     currency = Column(String, default="GBP")
#     expiry_date = Column(DateTime(timezone=True), nullable=False)
#     status = Column(Enum(ProposalStatusEnum), default=ProposalStatusEnum.NEW)
#     terms = Column(JSON, nullable=False)
#     custom_schedule = Column(JSON)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())
#     
#     organisation = relationship("Organisation", back_populates="proposals")
#     client = relationship("Client")
#     broker = relationship("BrokerUser")
#     
#     __table_args__ = (
#         Index('idx_proposals_organisation_id', 'organisation_id'),
#         Index('idx_proposals_client_id', 'client_id'),
#         Index('idx_proposals_status', 'status'),
#     )
