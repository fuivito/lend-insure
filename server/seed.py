from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import (
    Organisation, BrokerUser, Client, Policy, Agreement,
    Instalment, AgreementEvent, CommissionLine, Proposal,
    OrganisationStatusEnum, BrokerRoleEnum, AgreementStatusEnum,
    InstalmentStatusEnum, ProposalStatusEnum
)
from datetime import datetime, timedelta
from decimal import Decimal

def seed_database():
    print("🌱 Seeding database...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create organisation
        org = Organisation(
            name="Demo Insurance Brokers Ltd",
            status=OrganisationStatusEnum.ACTIVE
        )
        db.add(org)
        db.flush()
        print(f"✅ Created organisation: {org.name}")
        
        # Create broker admin
        broker_admin = BrokerUser(
            organisation_id=org.id,
            role=BrokerRoleEnum.BROKER_ADMIN,
            email="admin@demobroker.com",
            name="Sarah Johnson"
        )
        db.add(broker_admin)
        print(f"✅ Created broker admin: {broker_admin.email}")
        
        # Create broker
        broker = BrokerUser(
            organisation_id=org.id,
            role=BrokerRoleEnum.BROKER,
            email="broker@demobroker.com",
            name="Michael Smith"
        )
        db.add(broker)
        print(f"✅ Created broker: {broker.email}")
        
        # Create client
        client = Client(
            organisation_id=org.id,
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone="+44 20 7123 4567",
            dob=datetime(1985, 6, 15),
            address="123 High Street, London, SW1A 1AA"
        )
        db.add(client)
        db.flush()
        print(f"✅ Created client: {client.first_name} {client.last_name}")
        
        # Create policy
        policy = Policy(
            organisation_id=org.id,
            client_id=client.id,
            insurer_name="Aviva",
            product_type="Motor",
            policy_number="POL-2024-001",
            inception_date=datetime(2024, 1, 1),
            expiry_date=datetime(2024, 12, 31),
            gross_premium=Decimal("1200.00")
        )
        db.add(policy)
        db.flush()
        print(f"✅ Created policy: {policy.policy_number}")
        
        # Create agreement
        principal_amount = Decimal("1200.00")
        term_months = 12
        apr_bps = 995
        monthly_rate = (apr_bps / 10000) / 12
        monthly_payment = float(principal_amount) * monthly_rate / (1 - pow(1 + monthly_rate, -term_months))
        
        agreement = Agreement(
            organisation_id=org.id,
            client_id=client.id,
            policy_id=policy.id,
            principal_amount=principal_amount,
            apr_bps=apr_bps,
            term_months=term_months,
            status=AgreementStatusEnum.ACTIVE,
            start_date=datetime(2024, 1, 1),
            end_date=datetime(2024, 12, 31),
            outstanding_amount=principal_amount
        )
        db.add(agreement)
        db.flush()
        print(f"✅ Created agreement: {agreement.id}")
        
        # Create instalments
        for i in range(term_months):
            due_date = datetime(2024, 1, 1) + timedelta(days=i * 30)
            amount = Decimal(str(round(monthly_payment, 2)))
            
            instalment = Instalment(
                agreement_id=agreement.id,
                sequence=i + 1,
                due_date=due_date,
                amount_due=amount,
                amount_paid=amount if i < 3 else Decimal(0),
                status=InstalmentStatusEnum.PAID if i < 3 else InstalmentStatusEnum.UPCOMING
            )
            db.add(instalment)
        
        print(f"✅ Created {term_months} instalments")
        
        # Create agreement event
        event = AgreementEvent(
            agreement_id=agreement.id,
            type="AGREEMENT_CREATED",
            actor_type="BROKER",
            meta={"broker_id": broker.id, "broker_name": broker.name}
        )
        db.add(event)
        
        # Create commission line
        commission = CommissionLine(
            agreement_id=agreement.id,
            type="ORIGINATION",
            amount=Decimal("60.00"),
            currency="GBP"
        )
        db.add(commission)
        
        # Create proposals
        proposal1 = Proposal(
            id="prop-001",
            organisation_id=org.id,
            client_id=client.id,
            broker_id=broker.id,
            broker_name="Sarah Smith Insurance",
            broker_email="sarah@smithinsurance.com",
            insurance_type="Commercial Property",
            total_premium=Decimal("28500.00"),
            currency="GBP",
            expiry_date=datetime(2025, 1, 15),
            status=ProposalStatusEnum.NEW,
            created_at=datetime(2024, 12, 1, 10, 0, 0),
            updated_at=datetime(2024, 12, 1, 10, 0, 0),
            terms={
                "totalPremiumFinanced": 28500,
                "suggestedPlan": {
                    "instalments": 12,
                    "monthlyAmount": 2653
                },
                "apr": 8.4,
                "fees": {
                    "lendinsure": {
                        "percentage": 5.4,
                        "amount": 1539
                    },
                    "broker": {
                        "percentage": 2.0,
                        "amount": 570
                    }
                },
                "totalCostOfFinance": 2109,
                "totalRepayable": 30609
            }
        )
        db.add(proposal1)
        
        proposal2 = Proposal(
            id="prop-002",
            organisation_id=org.id,
            client_id=client.id,
            broker_id=broker.id,
            broker_name="Sarah Smith Insurance",
            broker_email="sarah@smithinsurance.com",
            insurance_type="Directors & Officers",
            total_premium=Decimal("15750.00"),
            currency="GBP",
            expiry_date=datetime(2025, 1, 22),
            status=ProposalStatusEnum.NEW,
            created_at=datetime(2024, 11, 28, 14, 30, 0),
            updated_at=datetime(2024, 12, 3, 9, 15, 0),
            terms={
                "totalPremiumFinanced": 15750,
                "suggestedPlan": {
                    "instalments": 9,
                    "monthlyAmount": 1925
                },
                "apr": 7.9,
                "fees": {
                    "lendinsure": {
                        "percentage": 5.4,
                        "amount": 851
                    },
                    "broker": {
                        "percentage": 2.0,
                        "amount": 315
                    }
                },
                "totalCostOfFinance": 1166,
                "totalRepayable": 16916
            }
        )
        db.add(proposal2)
        print("✅ Created 2 proposals")
        
        db.commit()
        print("🎉 Seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
