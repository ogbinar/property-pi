#!/usr/bin/env python3
"""Seed the database with test data for development."""

from datetime import datetime, timedelta
from uuid import uuid4

from app.database import engine, Base, SessionLocal
from app.models import User, Unit, Tenant, Lease, Payment, Expense, MaintenanceRequest
from app.auth import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already seeded. Run with --force to re-seed.")
            return

        print("Seeding database...")

        # Create admin user
        admin = User(
            id=str(uuid4()),
            name="Admin User",
            email="admin@propertypi.test",
            password_hash=hash_password("password123"),
            role="landlord",
        )
        db.add(admin)
        db.flush()

        # Create units
        units = []
        for i in range(1, 6):
            unit = Unit(
                id=str(uuid4()),
                number=f"A{i:02d}",
                name=f"Unit A{i:02d}",
                type="Apartment",
                status="occupied",
                rent=1200.0 + i * 100,
                deposit=1200.0 + i * 100,
                floor=1 if i <= 3 else 2,
                area=700 + i * 50,
                features="Parking, Laundry",
                description=f"Unit A{i:02d} on floor {1 if i <= 3 else 2}",
            )
            db.add(unit)
            units.append(unit)

        db.flush()

        now = datetime.now()

        # Create tenants
        tenants = []
        tenant_data = [
            ("Alice", "Smith", "alice@example.com", "555-0101", "Bob Smith, 555-0102"),
            ("Bob", "Jones", "bob@example.com", "555-0201", "Carol Jones, 555-0202"),
            ("Carol", "White", "carol@example.com", "555-0301", "Dave White, 555-0302"),
            ("Dave", "Brown", "dave@example.com", "555-0401", "Eve Brown, 555-0402"),
            ("Eve", "Davis", "eve@example.com", "555-0501", "Frank Davis, 555-0502"),
        ]
        for first, last, email, phone, emergency in tenant_data:
            tenant = Tenant(
                id=str(uuid4()),
                first_name=first,
                last_name=last,
                email=email,
                phone=phone,
                emergency_contact=emergency,
                unit_id=units[len(tenants)].id,
                user_id=admin.id,
                move_in_date=(now - timedelta(days=30 * (len(tenants) + 1))).strftime("%Y-%m-%d"),
                status="active",
                notes="",
                created_at=now.strftime("%Y-%m-%d %H:%M:%S"),
                updated_at=now.strftime("%Y-%m-%d %H:%M:%S"),
            )
            db.add(tenant)
            tenants.append(tenant)

        db.flush()

        # Create active leases
        leases = []
        for i, (unit, tenant) in enumerate(zip(units, tenants)):
            start_date = (now - timedelta(days=30 * (i + 1))).strftime("%Y-%m-%d")
            end_date = (now + timedelta(days=30 * (5 - i))).strftime("%Y-%m-%d")
            lease = Lease(
                id=str(uuid4()),
                tenant_id=tenant.id,
                unit_id=unit.id,
                start_date=start_date,
                end_date=end_date,
                monthly_rent=float(1200.0 + (i + 1) * 100),
                deposit_amount=float(1200.0 + (i + 1) * 100),
                status="active",
                tenant_access="full",
            )
            db.add(lease)
            leases.append(lease)

        db.flush()

        # Create current month payments
        current_month = now.strftime("%Y-%m")
        for i, (lease, unit) in enumerate(zip(leases, units)):
            payment = Payment(
                id=str(uuid4()),
                lease_id=lease.id,
                unit_id=unit.id,
                tenant_id=tenant.id,
                amount=float(1200.0 + (i + 1) * 100),
                date=now.strftime("%Y-%m-%d"),
                due_date=f"{current_month}-01",
                status="paid" if i % 2 == 0 else "pending",
                type="rent",
                payment_method="bank_transfer" if i % 2 == 0 else "check",
                notes="",
            )
            db.add(payment)

        db.flush()

        # Create sample expenses
        expense_data = [
            ("HVAC Repair", 450.0, "Maintenance", "Replaced filter in unit A01", units[0].id),
            ("Paint", 120.0, "Supplies", "Interior paint for unit A03", units[2].id),
            ("Insurance", 250.0, "Insurance", "Monthly property insurance", None),
            ("Plumbing", 350.0, "Maintenance", "Fixed leak in unit A02", units[1].id),
        ]
        for desc, amount, category, note, unit_id in expense_data:
            expense = Expense(
                id=str(uuid4()),
                unit_id=unit_id,
                amount=amount,
                category=category,
                description=note,
                date=now.strftime("%Y-%m-%d"),
                status="approved",
            )
            db.add(expense)

        # Create sample maintenance requests
        maintenance_data = [
            ("Leaky faucet", "Kitchen faucet dripping", "low", "open", 0),
            ("AC not cooling", "Unit feels warm, AC may need service", "high", "in_progress", 2),
            ("Broken lock", "Front door lock is stuck", "medium", "open", 3),
        ]
        for title, desc, priority, status, unit_idx in maintenance_data:
            maint = MaintenanceRequest(
                id=str(uuid4()),
                unit_id=units[unit_idx].id,
                tenant_id=tenants[unit_idx].id if unit_idx < len(tenants) else None,
                title=title,
                description=desc,
                priority=priority,
                status=status,
            )
            db.add(maint)

        db.commit()
        print("Database seeded successfully!")
        print(f"  - 1 admin user (admin@propertypi.test / password123)")
        print(f"  - {len(units)} units")
        print(f"  - {len(tenants)} tenants")
        print(f"  - {len(leases)} active leases")
        print(f"  - {len(leases)} payments")
        print(f"  - {len(expense_data)} expenses")
        print(f"  - {len(maintenance_data)} maintenance requests")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
