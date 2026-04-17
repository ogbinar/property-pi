# Project Specification: Property-Pi (5-Unit Rental Manager)

## 1. Overview
Property-Pi is a lightweight, specialized property management application designed specifically for small-scale landlords managing a small portfolio (e.g., a single 5-unit building). Unlike enterprise-grade software, Property-Pi focuses on simplicity, speed, and the essential workflows of a small-scale landlord.

## 2. Target User
Small-scale landlords or property managers who own/manage a small number of residential units (specifically optimized for 5-unit configurations).

## 3. Core Features (Brainstormed)

### 3.1. Unit & Lease Management (Core Focus)
- **Unit Dashboard:** A visual overview of all 5 units.
- **Unit Details:** 
    - Unit number/identifier.
    - Type (e.g., Studio, 1BR, 2BR).
    - Status (Occupied, Vacant, Maintenance, Under Renovation).
- **Lease & Contract Management:**
    - **Contract Preparation:** Templates for new lease agreements.
    - **Lease Lifecycle Tracking:** Automated tracking of lease start, end, and notice periods.
    - **Renewal Workflow:** 
        - Automated alerts for upcoming expirations (e.g., 60/30/15 days before).
        - "Renew/Do Not Renew" status tracking.
        - Rent increase tracking for renewal periods.
- **Tenant Profiles:**
    - Name and contact information (Email, Phone).
    - Linked active lease.
    - Document storage (Lease PDF, ID scans).

### 3.2. Financial Management (Rental Focus)
- **Rent Tracking & Collection:**
    - **Automated Rent Generation:** Monthly rent invoices generated automatically based on lease terms.
    - **Payment Status:** Real-time tracking (Paid, Pending, Overdue, Partial).
    - **Rent Adjustment History:** Tracking changes in rent amounts over time (crucial for renewals).
- **Expense Logging:**
    - Categorized expenses (Repairs, Utilities, Taxes, Insurance).
    - Receipt upload/attachment.
- **Simple Financial Reporting:**
    - Monthly Cash Flow (Income vs. Expenses).
    - Occupancy Rate tracking.
    - Total Revenue/Profit per unit.


### 3.4. Communication (Lightweight)
- **Tenant Notice System:** Send simple digital notices (e.g., "Maintenance scheduled for Tuesday").
- **Contact Log:** Quick log of interactions with tenants.

## 4. Technical Stack (Proposed)
- **Frontend:** Next.js (React) with Tailwind CSS for a clean, responsive UI.
- **Backend:** Node.js (API routes via Next.js) or a dedicated Express server.
- **Database:** PostgreSQL (via Prisma ORM) for robust relational data (Units <-> Tenants <-> Payments).
- **Authentication:** NextAuth.js or Clerk for secure landlord login.
- **Storage:** Supabase Storage or AWS S3 for lease documents and receipts.

## 5. Roadmap (Phases)

### Phase 1: MVP (Minimum Viable Product)
- Unit and Tenant CRUD (Create, Read, Update, Delete).
- Basic Rent Tracking (Marking rent as paid/unpaid).
- Dashboard showing occupancy and monthly revenue.

### Phase 2: Maintenance & Expenses
- Maintenance request logging.
- Expense tracking.
- Improved dashboard with financial summaries.

### Phase 3: Automation & Documents
- Automated lease expiration alerts.
- Document uploads for leases and receipts.
- PDF report generation.

## 6. Success Metrics
- Ability to see the status of all 5 units in under 5 seconds.
- Zero confusion on which tenant owes rent for the current month.
- Clear visibility into monthly net profit.
