from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import (
    Organisation, Client, Policy, Agreement, Instalment,
    OrganisationStatusEnum, AgreementStatusEnum, InstalmentStatusEnum
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
        
        # Create client
        client = Client(
            organisation_id=org.id,
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone="+44 20 7123 4567",
            address_line1="123 High Street",
            city="London",
            postcode="SW1A 1AA"
        )
        db.add(client)
        db.flush()
        print(f"✅ Created client: {client.first_name} {client.last_name}")
        
        # Create policy
        policy = Policy(
            organisation_id=org.id,
            client_id=client.id,
            insurer="Aviva",  # Changed from insurer_name
            product_type="Motor",
            policy_number="POL-2024-001",
            start_date=datetime(2024, 1, 1),  # Changed from inception_date
            end_date=datetime(2024, 12, 31),  # Changed from expiry_date
            premium_amount_pennies=120000  # Changed from gross_premium (1200.00 * 100)
        )
        db.add(policy)
        db.flush()
        print(f"✅ Created policy: {policy.policy_number}")
        
        # Create agreement
        principal_amount_pennies = 120000  # £1200 in pennies
        term_months = 12
        apr_bps = 995
        broker_fee_bps = 200  # 2% broker fee
        monthly_rate = (apr_bps / 10000) / 12
        monthly_payment = float(principal_amount_pennies / 100) * monthly_rate / (1 - pow(1 + monthly_rate, -term_months))
        
        agreement = Agreement(
            organisation_id=org.id,
            client_id=client.id,
            policy_id=policy.id,
            principal_amount_pennies=principal_amount_pennies,
            apr_bps=apr_bps,
            term_months=term_months,
            broker_fee_bps=broker_fee_bps,
            status=AgreementStatusEnum.ACTIVE,
            signed_at=datetime(2024, 1, 1),
            activated_at=datetime(2024, 1, 2)
        )
        db.add(agreement)
        db.flush()
        print(f"✅ Created agreement: {agreement.id}")
        
        # Create instalments
        for i in range(term_months):
            due_date = datetime(2024, 1, 1) + timedelta(days=i * 30)
            amount_pennies = int(round(monthly_payment * 100))  # Convert to pennies

            instalment = Instalment(
                agreement_id=agreement.id,
                sequence_number=i + 1,
                due_date=due_date,
                amount_pennies=amount_pennies,
                status=InstalmentStatusEnum.PAID if i < 3 else InstalmentStatusEnum.UPCOMING
            )
            db.add(instalment)

        print(f"✅ Created {term_months} instalments")

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
