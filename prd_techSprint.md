# Product Requirements Document (PRD)
## Government Project Transparency Platform

**Version:** 1.0  
**Date:** January 27, 2026  
**Document Owner:** Product Engineering Team  
**Status:** Draft for Review

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Vision
A tamper-proof, public transparency platform that transforms government project tracking from a closed administrative system into a public accountability infrastructure. The platform ensures every government scheme update is permanent, auditable, and visible to citizens.

### 1.2 Problem Statement
Current government project tracking systems suffer from:
- Silent data manipulation without accountability
- Lack of public visibility into project progress
- No immutable audit trails
- Limited citizen participation mechanisms
- Trust deficit between government and citizens

### 1.3 Solution Overview
An append-only, event-sourced platform with cryptographic hash-chaining that guarantees data integrity, enables public scrutiny, and maintains comprehensive audit trails for all government projects.

### 1.4 Success Metrics
- **Transparency:** 100% of project updates publicly visible within 24 hours
- **Integrity:** Zero successful data tampering incidents
- **Engagement:** Citizen complaint submission and tracking
- **Reliability:** 99.9% uptime SLA
- **Performance:** <2 second page load time for public portal

---

## 2. PRODUCT SCOPE

### 2.1 In Scope
- Project creation and lifecycle management
- Immutable timeline event tracking
- Public complaint submission and tracking
- Role-based access control (Public, Government Employee, Admin, Auditor)
- Document management with integrity verification
- Administrative correction workflow (append-only)
- Public analytics dashboards
- Audit trail generation
- Multi-factor authentication for privileged users

### 2.2 Out of Scope (Phase 1)
- Payment processing or fund disbursement
- Real-time chat between citizens and officials
- Mobile native applications (mobile-responsive web only)
- Multi-language support (English only in MVP)
- AI-powered fraud detection
- Blockchain anchoring (optional for future)

### 2.3 Future Considerations
- Integration with existing government databases
- Advanced analytics and predictive insights
- Public API for third-party developers
- Blockchain timestamping for additional verification
- Mobile applications (iOS/Android)

---

## 3. USER PERSONAS & ROLES

### 3.1 Public Citizen
**Profile:** General public seeking information about government projects  
**Needs:**
- View all projects in their region
- Track project progress over time
- Submit complaints about delays or quality issues
- Access project documents
- View project analytics

**Permissions:**
- Read access to all public data
- Submit complaints
- View complaint status

### 3.2 Government Employee
**Profile:** Department officials responsible for project execution  
**Needs:**
- Create new projects
- Post progress updates
- Upload supporting documents
- Respond to citizen complaints
- Track departmental projects

**Permissions:**
- Create projects within their department
- Add timeline events to assigned projects
- Upload documents
- View and respond to complaints

**Verification Required:** Admin approval + department validation

### 3.3 System Administrator
**Profile:** Platform managers ensuring system integrity  
**Needs:**
- Verify government employee accounts
- Monitor system integrity
- Create correction entries for errors
- Moderate inappropriate content
- Access comprehensive audit logs

**Permissions:**
- User verification and role assignment
- Create correction events
- Full audit log access
- Content moderation tools

**Security:** Mandatory MFA, IP whitelisting optional

### 3.4 Auditor (Future Role)
**Profile:** Independent reviewers or government audit bodies  
**Needs:**
- Read-only access to all records
- Export capabilities for analysis
- Integrity verification tools

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Authentication & Authorization

#### FR-AUTH-001: User Registration
- System shall support email-based registration
- Email verification required before access
- Password requirements: minimum 12 characters, complexity rules enforced

#### FR-AUTH-002: Role-Based Access Control
- System shall enforce strict RBAC for all operations
- Four roles: PUBLIC, GOV_EMPLOYEE, ADMIN, AUDITOR
- Role assignment only by administrators
- Government employee accounts require admin verification

#### FR-AUTH-003: Multi-Factor Authentication
- MFA mandatory for GOV_EMPLOYEE and ADMIN roles
- Support TOTP-based authenticators
- Backup codes provided during setup

#### FR-AUTH-004: Session Management
- JWT access tokens valid for 15 minutes
- Refresh tokens valid for 7 days
- Automatic token rotation on refresh
- Secure token storage (httpOnly cookies)

### 4.2 Project Management

#### FR-PROJ-001: Project Creation
**Actor:** Government Employee  
**Required Fields:**
- Project name (max 200 characters)
- Department (dropdown)
- Budget (INR, validated format)
- State and district (dropdown cascading)
- GPS coordinates (latitude/longitude)
- Start date
- Expected end date
- Sanction document upload

**Validation:**
- Budget must be positive number
- End date must be after start date
- Coordinates must be within India
- Department must match employee's department

**System Behavior:**
- Generate unique project ID
- Create genesis event in ledger
- Set initial status as "Sanctioned"
- Make immediately visible to public

#### FR-PROJ-002: Project Listing & Filtering
**Actor:** All users  
**Features:**
- Paginated list (20 items per page)
- Filter by: state, district, department, status, budget range
- Sort by: creation date, budget, name
- Search by project name or ID
- Map view with project markers

#### FR-PROJ-003: Project Details View
**Actor:** All users  
**Display:**
- Complete project metadata
- Current status and progress percentage
- Immutable timeline (chronological)
- Associated documents with download links
- Complaint count and status summary
- Location map

### 4.3 Event Ledger System (Core Feature)

#### FR-LEDGER-001: Timeline Event Creation
**Actor:** Government Employee (project owner only)  
**Event Types:**
- PROGRESS_UPDATE
- MILESTONE_ACHIEVED
- DELAY_REPORTED
- COMPLETION_DECLARED
- DOCUMENT_UPLOADED

**Required Data:**
- Event type
- Description (max 1000 characters)
- Progress percentage (0-100)
- Optional: document attachment
- Optional: photos (max 5)

**System Behavior:**
1. Fetch previous event's hash
2. Generate event payload with timestamp and actor ID
3. Calculate current hash: `SHA256(event_data + previous_hash)`
4. Store event as immutable record
5. Update project's current status
6. Trigger notification queue

#### FR-LEDGER-002: Hash Chain Integrity
- Every event must reference previous event's hash
- Genesis event uses predefined seed hash
- System must validate hash chain on every read
- Broken chain triggers immediate integrity alert
- Alert visible to public on project page

#### FR-LEDGER-003: Timeline Display
**Actor:** All users  
**Features:**
- Chronological reverse order (newest first)
- Each event shows: date, actor, type, description, progress
- Visual timeline with progress indicators
- Document links embedded
- Correction events clearly marked

#### FR-LEDGER-004: Immutability Enforcement
- No UPDATE queries on ledger table
- No DELETE queries on ledger table
- Database triggers prevent accidental modifications
- Audit log for any attempted violations

### 4.4 Complaint System

#### FR-COMP-001: Complaint Submission
**Actor:** Public (authenticated)  
**Fields:**
- Project ID
- Complaint type (dropdown): Delay, Quality Issue, Corruption Allegation, Document Discrepancy, Other
- Description (max 2000 characters)
- Evidence upload (optional, max 10MB)
- Contact preference (email/anonymous)

**Validation:**
- Minimum description length: 50 characters
- Valid project ID
- Supported file types: PDF, JPG, PNG

**System Behavior:**
- Generate unique complaint ID
- Store as immutable record
- Initial status: "Submitted"
- Send notification to project owner and admin
- Make visible on project page immediately

#### FR-COMP-002: Complaint Status Tracking
**Statuses:**
- Submitted → Under Review → Responded → Resolved/Rejected

**Status Changes:**
- Only government employee or admin can update
- Each status change creates new event
- Reason required for rejection
- All status history visible to public

#### FR-COMP-003: Complaint Response
**Actor:** Government Employee, Admin  
**Features:**
- Text response (max 1000 characters)
- Optional document attachment
- Response visible to public
- Email notification to complainant

### 4.5 Document Management

#### FR-DOC-001: Document Upload
**Supported Types:** PDF, JPG, PNG, DOCX  
**Size Limit:** 20MB per file  
**Storage:**
- Object storage (S3-compatible)
- Generate SHA256 hash on upload
- Store metadata in database: URL, hash, uploader, timestamp

#### FR-DOC-002: Document Integrity Verification
- Display file hash on document page
- Provide hash verification tool
- Alert if file hash doesn't match stored hash
- Prevent silent file replacement

#### FR-DOC-003: Document Access Control
- Sanction documents: public
- Progress reports: public
- Internal memos: admin only (future)
- Complaint evidence: public

### 4.6 Administrative Correction System

#### FR-ADMIN-001: Correction Workflow
**Trigger:** Error in published event  
**Process:**
1. Admin cannot edit original event
2. Admin creates CORRECTION event type
3. Correction event references original event ID
4. Correction includes: corrected data, reason, timestamp
5. Both events remain in timeline

**Public Display:**
```
Original Entry (Strikethrough): "Budget: 50 Lakhs"
Correction: "Budget: 5 Crores"
Reason: "Typographical error in original entry"
Corrected By: Admin Name
Correction Date: [timestamp]
```

#### FR-ADMIN-002: User Verification
**Process:**
- Government employee registers
- Status: "Pending Verification"
- Admin reviews: department ID, official email, credentials
- Admin approves or rejects
- Approved users can create projects

#### FR-ADMIN-003: Audit Log Access
**Display:**
- All administrative actions
- User verification actions
- Correction entries
- Failed login attempts
- Role assignments
- Exportable to CSV

### 4.7 Analytics & Reporting

#### FR-ANALYTICS-001: Public Dashboard
**Metrics:**
- Total projects by state/district
- Projects by status (pie chart)
- Budget allocation vs spending
- Average project completion time
- Complaint resolution rate
- Department-wise performance

**Filters:**
- Date range
- Geographic region
- Department
- Budget range

#### FR-ANALYTICS-002: Government Dashboard
**For Government Employees:**
- Their department's projects
- Pending complaints
- Upcoming milestones
- Document upload status

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance

#### NFR-PERF-001: Response Time
- API responses: <500ms (p95)
- Page load time: <2 seconds (public portal)
- Timeline load: <1 second for 100 events
- Search results: <1 second

#### NFR-PERF-002: Throughput
- Support 1000 concurrent users
- Handle 100 project creation requests/hour
- Process 500 timeline events/hour
- Support 1000 complaint submissions/day

#### NFR-PERF-003: Database Performance
- Read queries: <100ms
- Write queries: <200ms
- Hash calculation: <50ms per event
- Integrity verification: <500ms per project

### 5.2 Scalability

#### NFR-SCALE-001: Horizontal Scaling
- Stateless backend services
- Database read replicas for public queries
- CDN for static assets
- Load balancer with auto-scaling rules

#### NFR-SCALE-002: Data Growth
- Support 10,000 projects in year 1
- Support 100,000 timeline events in year 1
- Support 50,000 complaints in year 1
- Document storage: 1TB capacity

#### NFR-SCALE-003: Scaling Strategy
**Read Heavy Load:**
- Redis caching for public data (TTL: 5 minutes)
- Database read replicas
- CDN for frontend and documents

**Write Heavy Load:**
- Message queue for async processing
- Background workers for notifications
- Batch processing for analytics

### 5.3 Availability & Reliability

#### NFR-AVAIL-001: Uptime
- 99.9% uptime SLA (8.76 hours downtime/year)
- Planned maintenance windows: Sunday 2-4 AM IST
- Advance notification for maintenance

#### NFR-AVAIL-002: Fault Tolerance
- Multi-AZ database deployment
- Automatic failover for database
- Health check endpoints for all services
- Circuit breaker for external dependencies

#### NFR-AVAIL-003: Data Durability
- Database: 99.99% durability (managed service)
- Object storage: 99.999999999% durability (S3 standard)
- No single point of failure in architecture

### 5.4 Security

#### NFR-SEC-001: Data Encryption
- TLS 1.3 for all communications
- Database encryption at rest (AES-256)
- Encrypted environment variables
- Secure key management service

#### NFR-SEC-002: Authentication Security
- Password hashing: bcrypt (cost factor 12)
- JWT signing: RS256 algorithm
- Token rotation on compromise detection
- Rate limiting on login: 5 attempts per 15 minutes

#### NFR-SEC-003: Input Validation
- Server-side validation for all inputs
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- CSRF protection (token-based)

#### NFR-SEC-004: API Security
- Rate limiting: 100 requests/minute per IP
- API key rotation for service accounts
- CORS policy enforcement
- Request size limits (10MB max)

#### NFR-SEC-005: File Upload Security
- Virus scanning on upload
- File type validation (magic number check)
- Filename sanitization
- Isolated storage bucket

### 5.5 Monitoring & Observability

#### NFR-MON-001: Logging
- Centralized logging (ELK stack or equivalent)
- Log retention: 90 days
- Log levels: ERROR, WARN, INFO, DEBUG
- Sensitive data redaction in logs

#### NFR-MON-002: Metrics
- System metrics: CPU, memory, disk, network
- Application metrics: request rate, error rate, latency
- Business metrics: projects created, complaints filed
- Database metrics: connections, query performance

#### NFR-MON-003: Alerting
- Critical alerts: system down, database unreachable
- Warning alerts: high error rate, slow responses
- Notification channels: email, Slack, PagerDuty
- Escalation policy for unacknowledged alerts

#### NFR-MON-004: Integrity Monitoring
- Hourly hash chain verification job
- Alert on chain break detection
- Suspicious activity detection (unusual patterns)
- Failed authentication tracking

### 5.6 Backup & Disaster Recovery

#### NFR-DR-001: Backup Strategy
- Automated daily database snapshots
- Hourly incremental backups
- 30-day backup retention
- Cross-region backup replication

#### NFR-DR-002: Recovery Objectives
- RPO (Recovery Point Objective): 1 hour
- RTO (Recovery Time Objective): 4 hours
- Quarterly disaster recovery drills
- Documented recovery procedures

#### NFR-DR-003: Data Restoration
- Point-in-time recovery capability
- Document versioning in object storage
- Rollback capability for application deployments
- Tested restore procedures

### 5.7 Compliance & Auditability

#### NFR-COMP-001: Audit Trail
- All actions logged with actor ID and timestamp
- Immutable audit logs
- Audit log integrity hash chain
- Exportable audit reports

#### NFR-COMP-002: Data Retention
- Project data: indefinite retention
- Event ledger: indefinite retention
- Audit logs: 7 years minimum
- User data: retention per privacy policy

#### NFR-COMP-003: Legal Compliance
- Data privacy compliance (Indian IT Act)
- Right to information compliance
- Digital signature readiness (future)
- Export controls for data

### 5.8 Usability

#### NFR-USE-001: Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader compatibility
- Keyboard navigation support
- Minimum contrast ratios

#### NFR-USE-002: Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

#### NFR-USE-003: Mobile Responsiveness
- Responsive design (320px to 2560px)
- Touch-friendly interface
- Mobile-optimized images
- Progressive Web App features

---

## 6. TECHNICAL ARCHITECTURE

### 6.1 Architecture Style
**Hybrid Layered + Event-Driven Architecture**

**Rationale:**
- Government apps require traceability → Event sourcing
- Timeline updates suit event-driven patterns
- Layered structure provides maintainability
- Append-only design prevents data manipulation

### 6.2 System Components

#### Frontend Layer
**Technology:** React 18+ with TypeScript  
**State Management:** Redux Toolkit or Zustand  
**Routing:** React Router v6  
**UI Framework:** Tailwind CSS + Shadcn/UI  
**Build Tool:** Vite  

**Modules:**
1. Public Portal (unauthenticated + authenticated citizens)
2. Government Dashboard (verified employees)
3. Admin Panel (administrators)

#### API Gateway
**Purpose:** Single entry point for all requests  
**Responsibilities:**
- Request authentication (JWT validation)
- Rate limiting enforcement
- Request logging
- Response compression
- CORS handling

**Technology:** Express.js middleware or dedicated gateway (Kong/AWS API Gateway)

#### Backend Services

**1. Auth Service**
- User registration and login
- JWT token generation and validation
- Role management
- MFA handling
- Session management

**2. Project Service**
- Project CRUD (Create, Read only)
- Project metadata management
- Project listing and filtering
- Search functionality

**3. Event Ledger Service** (Critical Component)
- Timeline event creation
- Hash chain generation
- Hash integrity verification
- Event retrieval
- Correction event handling

**4. Complaint Service**
- Complaint submission
- Status management
- Response handling
- Evidence storage

**5. Notification Service**
- Asynchronous email delivery
- SMS alerts (future)
- Admin notifications
- Queue-based processing

**Technology Stack:** Node.js + Express or Python + FastAPI

#### Message Queue
**Purpose:** Async task processing  
**Use Cases:**
- Email notifications
- SMS alerts
- Analytics computation
- Background jobs

**Technology:** RabbitMQ or AWS SQS (managed service preferred)

#### Data Layer

**Primary Database: PostgreSQL 15+**
- Main application data
- Event ledger (append-only table)
- User accounts
- Projects metadata

**Cache: Redis 7+**
- Public data caching (5-minute TTL)
- Session storage
- Rate limiting counters

**Object Storage: S3-compatible**
- Document storage
- Image storage
- Backup archives

**Audit Database: PostgreSQL (separate instance)**
- System audit logs
- Administrative actions
- Security events

### 6.3 Database Schema

#### Core Tables

**users**
```
id: UUID (PK)
name: VARCHAR(200)
email: VARCHAR(255) UNIQUE
password_hash: VARCHAR(255)
role: ENUM('PUBLIC', 'GOV_EMPLOYEE', 'ADMIN', 'AUDITOR')
department: VARCHAR(100)
verified: BOOLEAN
mfa_enabled: BOOLEAN
mfa_secret: VARCHAR(255)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**projects**
```
id: UUID (PK)
project_name: VARCHAR(200)
department: VARCHAR(100)
budget: DECIMAL(15,2)
state: VARCHAR(100)
district: VARCHAR(100)
latitude: DECIMAL(10,8)
longitude: DECIMAL(11,8)
start_date: DATE
expected_end_date: DATE
current_status: VARCHAR(50)
current_progress: INTEGER (0-100)
created_by: UUID (FK → users.id)
created_at: TIMESTAMP
```

**event_ledger** (APPEND-ONLY)
```
id: UUID (PK)
project_id: UUID (FK → projects.id)
event_type: VARCHAR(50)
event_data: JSONB
previous_hash: VARCHAR(64)
current_hash: VARCHAR(64) INDEXED
created_by: UUID (FK → users.id)
created_at: TIMESTAMP
```

**Database Constraints:**
- Trigger to prevent UPDATE/DELETE on event_ledger
- Hash index on current_hash for verification
- Partial index on projects where verified = true

**complaints**
```
id: UUID (PK)
project_id: UUID (FK → projects.id)
complaint_type: VARCHAR(100)
description: TEXT
status: VARCHAR(50)
evidence_url: TEXT
submitted_by: UUID (FK → users.id)
created_at: TIMESTAMP
```

**documents**
```
id: UUID (PK)
file_url: TEXT
file_hash: VARCHAR(64)
file_size: BIGINT
uploaded_by: UUID (FK → users.id)
uploaded_at: TIMESTAMP
```

**audit_logs**
```
id: UUID (PK)
actor_id: UUID (FK → users.id)
action_type: VARCHAR(100)
target_id: UUID
metadata: JSONB
hash: VARCHAR(64)
created_at: TIMESTAMP
```

### 6.4 Hash Chain Implementation

**Genesis Event:**
```javascript
{
  event_id: "uuid",
  project_id: "project-uuid",
  event_type: "PROJECT_CREATED",
  event_data: { /* project metadata */ },
  previous_hash: "0000000000000000000000000000000000000000000000000000000000000000",
  current_hash: SHA256(event_data + previous_hash),
  timestamp: "ISO-8601",
  actor_id: "user-uuid"
}
```

**Subsequent Events:**
```javascript
current_hash = SHA256(
  JSON.stringify(event_data) + 
  previous_hash + 
  timestamp + 
  actor_id
)
```

**Integrity Verification:**
```javascript
function verifyChain(projectId) {
  events = fetchEventsOrdered(projectId);
  
  for (i = 1; i < events.length; i++) {
    computed_hash = SHA256(
      events[i].event_data + 
      events[i-1].current_hash
    );
    
    if (computed_hash !== events[i].current_hash) {
      return {
        valid: false,
        broken_at: events[i].id
      };
    }
  }
  
  return { valid: true };
}
```

### 6.5 API Contract Specification

**Base URL:** `https://api.transparency.gov.in/v1`

#### Authentication Endpoints

**POST /auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "role": "GOV_EMPLOYEE",
    "department": "Public Works"
  }
}
```

**POST /auth/refresh**
```json
Request:
{
  "refresh_token": "eyJhbGc..."
}

Response (200):
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

#### Project Endpoints

**POST /projects/create** (Gov Employee only)
```json
Request:
{
  "project_name": "Rural Road Development - Phase 2",
  "department": "Public Works",
  "budget": 50000000,
  "state": "Gujarat",
  "district": "Surat",
  "latitude": 21.1702,
  "longitude": 72.8311,
  "start_date": "2026-02-01",
  "expected_end_date": "2027-01-31",
  "sanction_document_url": "https://..."
}

Response (201):
{
  "project_id": "uuid",
  "status": "created",
  "genesis_event_id": "uuid"
}
```

**GET /projects/list** (Public)
```
Query Parameters:
- state (optional)
- district (optional)
- department (optional)
- status (optional)
- page (default: 1)
- limit (default: 20, max: 100)

Response (200):
{
  "projects": [
    {
      "id": "uuid",
      "project_name": "...",
      "department": "...",
      "status": "In Progress",
      "progress": 45,
      "budget": 50000000,
      "created_at": "..."
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8,
    "limit": 20
  }
}
```

**GET /projects/:id** (Public)
```json
Response (200):
{
  "project": {
    "id": "uuid",
    "project_name": "...",
    "department": "...",
    "budget": 50000000,
    "location": {
      "state": "Gujarat",
      "district": "Surat",
      "coordinates": [21.1702, 72.8311]
    },
    "status": "In Progress",
    "progress": 45,
    "start_date": "2026-02-01",
    "expected_end_date": "2027-01-31",
    "created_by": "Official Name",
    "created_at": "..."
  },
  "integrity": {
    "verified": true,
    "last_check": "..."
  }
}
```

#### Event Ledger Endpoints

**POST /projects/:id/events** (Gov Employee, project owner only)
```json
Request:
{
  "event_type": "PROGRESS_UPDATE",
  "description": "Foundation work completed. Starting pillar construction.",
  "progress_percentage": 25,
  "document_url": "https://..."
}

Response (201):
{
  "event_id": "uuid",
  "current_hash": "abc123...",
  "created_at": "..."
}
```

**GET /projects/:id/timeline** (Public)
```json
Response (200):
{
  "timeline": [
    {
      "event_id": "uuid",
      "event_type": "PROGRESS_UPDATE",
      "description": "...",
      "progress": 25,
      "actor": "Official Name",
      "created_at": "...",
      "hash": "abc123...",
      "is_correction": false
    }
  ],
  "integrity_status": {
    "verified": true,
    "last_check": "..."
  }
}
```

**GET /projects/:id/verify-integrity** (Public)
```json
Response (200):
{
  "project_id": "uuid",
  "is_valid": true,
  "total_events": 15,
  "verification_time": "2026-01-27T10:30:00Z"
}

OR (if tampered):

Response (200):
{
  "project_id": "uuid",
  "is_valid": false,
  "broken_at_event": "uuid",
  "total_events": 15,
  "verification_time": "..."
}
```

#### Complaint Endpoints

**POST /complaints/create** (Public, authenticated)
```json
Request:
{
  "project_id": "uuid",
  "complaint_type": "Quality Issue",
  "description": "Poor quality materials being used...",
  "evidence_url": "https://..."
}

Response (201):
{
  "complaint_id": "uuid",
  "status": "Submitted",
  "created_at": "..."
}
```

**GET /complaints/project/:projectId** (Public)
```json
Response (200):
{
  "complaints": [
    {
      "id": "uuid",
      "complaint_type": "Delay",
      "description": "...",
      "status": "Under Review",
      "submitted_by": "Anonymous",
      "created_at": "...",
      "responses": [
        {
          "text": "We are investigating...",
          "responded_by": "Official Name",
          "responded_at": "..."
        }
      ]
    }
  ]
}
```

#### Admin Endpoints

**POST /admin/corrections** (Admin only)
```json
Request:
{
  "original_event_id": "uuid",
  "corrected_data": {
    "budget": 5000000
  },
  "reason": "Typographical error in original entry"
}

Response (201):
{
  "correction_event_id": "uuid",
  "status": "created"
}
```

**POST /admin/users/:userId/verify** (Admin only)
```json
Request:
{
  "verified": true,
  "notes": "Valid government ID provided"
}

Response (200):
{
  "user_id": "uuid",
  "verified": true,
  "updated_at": "..."
}
```

### 6.6 Infrastructure Architecture

#### MVP Architecture (Phase 1)
```
┌─────────────┐
│   Frontend  │ → Vercel/Netlify (CDN)
└─────────────┘
       ↓
┌─────────────┐
│ API Gateway │ → Single Node.js server
└─────────────┘
       ↓
┌─────────────┐
│ PostgreSQL  │ → Managed database (AWS RDS / Supabase)
└─────────────┘
       ↓
┌─────────────┐
│   Storage   │ → AWS S3 / Cloudinary
└─────────────┘
```

#### Production Architecture (Phase 2)
```
                    ┌──────────────┐
                    │  CloudFlare  │ (CDN + DDoS)
                    └──────────────┘
                           ↓
                    ┌──────────────┐
                    │ Load Balancer│
                    └──────────────┘
                           ↓
        ┌──────────────────┴───────────────────┐
        ↓                  ↓                    ↓
┌──────────────┐  ┌──────────────┐    ┌──────────────┐
│ API Gateway  │  │ API Gateway  │    │ API Gateway  │
│  Instance 1  │  │  Instance 2  │    │  Instance N  │
└──────────────┘  └──────────────┘    └──────────────┘
        ↓                  ↓                    ↓
┌───────────────────────────────────────────────────┐
│           Backend Services Layer                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │  Auth  │ │Project │ │ Ledger │ │Complaint│   │
│  │Service │ │Service │ │Service │ │Service │    │
│  └────────┘ └────────┘ └────────┘ └────────┘    │
└───────────────────────────────────────────────────┘
                           ↓
                    ┌──────────────┐
                    │ Message Queue│ (RabbitMQ)
                    └──────────────┘
                           ↓
        ┌──────────────────┴───────────────────┐
        ↓                  ↓                    ↓
┌──────────────┐  ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │  │     Redis    │    │  S3 Storage  │
│   Primary    │  │    Cache     │    │  Documents   │
└──────────────┘  └──────────────┘    └──────────────┘
        ↓
┌──────────────┐
│  PostgreSQL  │
│ Read Replica │
└──────────────┘
```

#### Deployment Strategy







**MVP Deployment:**
- Frontend: Vercel (auto-deploy from main branch)
- Backend: Railway / Render (single instance)
- Database: Supabase free tier or AWS RDS t3.micro
- Storage: Cloudinary free tier
- **Cost:** ~$50-100/month

**Production Deployment:**
- Frontend: CloudFlare CDN
- Backend: AWS ECS or Kubernetes (3+ instances)
- Database: AWS RDS Multi-AZ (db.t3.medium)
- Cache: AWS ElastiCache Redis
- Storage: AWS S3 Standard
- Queue: AWS SQS or self-hosted RabbitMQ
- **Cost:** ~$500-800/month (scales with usage)

### 6.7 CI/CD Pipeline

```
Developer Push
      ↓
GitHub Repository
      ↓
GitHub Actions / GitLab CI
      ↓
┌─────────────────┐
│  Run Tests      │ (Unit, Integration, E2E)
└─────────────────┘
      ↓
┌─────────────────┐
│  Lint & Format  │
└─────────────────┘
      ↓
┌─────────────────┐
│  Build Docker   │
│     Image       │
└─────────────────┘
      ↓
┌─────────────────┐
│  Push to ECR    │
└─────────────────┘
      ↓
┌─────────────────┐
│  Deploy Staging │
└─────────────────┘
      ↓
┌─────────────────┐
│  Smoke Tests    │
└─────────────────┘
      ↓
┌─────────────────┐
│  Manual Approval│ (for production)
└─────────────────┘
      ↓
┌─────────────────┐
│Deploy Production│
└─────────────────┘
```

### 6.8 Security Layers

**Layer 1: Network Security**
- WAF (Web Application Firewall)
- DDoS protection
- Rate limiting at CDN level

**Layer 2: API Security**
- JWT authentication
- Role-based authorization
- Input validation
- SQL injection prevention
- XSS prevention

**Layer 3: Data Security**
- Encryption in transit (TLS 1.3)
- Encryption at rest (AES-256)
- Secure key management (AWS KMS / HashiCorp Vault)

**Layer 4: Application Security**
- Dependency scanning (Snyk / Dependabot)
- SAST (Static Analysis Security Testing)
- Container scanning
- Regular security audits

**Layer 5: Operational Security**
- MFA for all admin access
- IP whitelisting for admin panel
- Audit logging
- Intrusion detection

---

## 7. USER INTERFACE SPECIFICATIONS

### 7.1 Public Portal

#### 7.1.1 Homepage
**Components:**
- Hero section with platform mission
- Real-time statistics: total projects, total budget, states covered
- Search bar (project name, ID, location)
- Featured/recent projects carousel
- Quick filters: by state, department, status

**Layout:**
- Responsive grid
- Mobile: single column
- Tablet: 2 columns
- Desktop: 3 columns with sidebar filters

#### 7.1.2 Project Listing Page
**Features:**
- Card-based project display
- Each card shows: name, location, department, status, progress bar, budget
- Pagination (20 per page)
- Filter sidebar: state, district, department, status, budget range
- Sort options: newest, oldest, budget high-low
- Map view toggle (shows all projects as markers)

**Interactions:**
- Click card → Project details page
- Filter selection → instant update
- Map marker click → project preview popup

#### 7.1.3 Project Details Page
**Sections:**

**1. Header Section**
- Project name (H1)
- Status badge (color-coded: green=completed, yellow=in-progress, red=delayed)
- Progress percentage with visual bar
- Location with embedded map
- Quick stats: budget, start date, expected completion

**2. Timeline Section**
- Vertical timeline (most recent at top)
- Each event shows: date, event type icon, description, actor name, attached documents
- Correction events highlighted with orange background
- "Verify Integrity" button → shows hash verification status

**3. Documents Section**
- List of all uploaded documents
- Each document: name, upload date, uploader, download button, hash display
- Filter by document type

**4. Complaints Section**
- Count of total complaints by status
- List of complaints (public, non-sensitive)
- Each complaint: type, description excerpt, status, response if any
- "Submit Complaint" button

**5. Analytics Mini-Dashboard**
- Timeline visualization (graph of progress over time)
- Budget vs spending (if data available)

#### 7.1.4 Complaint Submission Modal
**Fields:**
- Complaint type (dropdown)
- Description (textarea, 50-2000 chars)
- Evidence upload (optional, drag-drop)
- Contact preference (email or anonymous)

**Validation:**
- Real-time character count
- File size check before upload
- Submission confirmation dialog

### 7.2 Government Dashboard

#### 7.2.1 Dashboard Home
**Widgets:**
- "My Projects" summary (total, in-progress, completed)
- Pending actions: complaints awaiting response, documents to upload
- Recent activity feed
- Quick action buttons: Create Project, Add Update

**Layout:** Card-based responsive grid

#### 7.2.2 Create Project Form
**Multi-step wizard:**

**Step 1: Basic Information**
- Project name
- Department (auto-filled from user profile, locked)
- Budget
- Description

**Step 2: Location**
- State dropdown
- District dropdown (populated based on state)
- Address
- Map picker for coordinates

**Step 3: Timeline**
- Start date
- Expected end date
- Milestones (optional, future)

**Step 4: Documents**
- Sanction order upload (required)
- Other documents (optional)

**Step 5: Review & Submit**
- Summary of all entered data
- Confirmation checkbox
- Submit button

**Validation:**
- All required fields
- Budget format check
- Date logic validation
- File upload success

**On Submit:**
- Loading spinner
- Success message with project ID
- Redirect to project details page

#### 7.2.3 Add Timeline Update Form
**Fields:**
- Event type (dropdown)
- Progress percentage (slider or input, 0-100)
- Description (rich text editor, max 1000 chars)
- Photos upload (optional, max 5)
- Document upload (optional)

**Preview:**
- Show how the update will appear on public timeline

**On Submit:**
- Hash calculation indicator
- Success message
- Timeline auto-refresh

#### 7.2.4 Complaints Management
**View:**
- Table of complaints for their projects
- Columns: ID, project, type, status, date
- Filter by status, project
- Click row → complaint detail modal

**Complaint Detail Modal:**
- Full description
- Evidence display (if any)
- Status history
- Response form (textarea)
- Status update dropdown
- Submit response button

### 7.3 Admin Panel

#### 7.3.1 User Verification Queue
**Table View:**
- Pending government employee registrations
- Columns: name, email, department, registration date
- Actions: view details, approve, reject

**Detail Modal:**
- User information
- Uploaded credentials (if any)
- Department verification
- Approve/reject buttons with reason field

#### 7.3.2 Correction Entry Form
**Process:**
1. Search for event by ID or browse project timeline
2. Select event to correct
3. Form shows:
   - Original event data (read-only, greyed out)
   - Corrected data fields
   - Reason for correction (required)
4. Preview of how correction will appear
5. Submit button

**Validation:**
- Reason minimum length: 20 characters
- At least one field must be different

#### 7.3.3 Audit Log Viewer
**Features:**
- Filterable table: date range, actor, action type
- Columns: timestamp, actor, action, target, details
- Export to CSV button
- Drill-down to see full action metadata

**Visual Indicators:**
- Color-coded action types (green=creation, yellow=update, red=critical)
- Failed action highlighting

#### 7.3.4 System Integrity Dashboard
**Metrics:**
- Total projects
- Total events
- Last integrity check time
- Projects with broken chains (should be 0)
- Failed verification attempts

**Actions:**
- "Run Full Integrity Check" button (scans all projects)
- Alert configuration for integrity violations

### 7.4 Design System

#### Color Palette
- Primary: #2563EB (Government Blue)
- Secondary: #10B981 (Success Green)
- Warning: #F59E0B (Alert Orange)
- Danger: #EF4444 (Error Red)
- Neutral: Tailwind Gray scale
- Background: #F9FAFB
- Surface: #FFFFFF

#### Typography
- Headings: Inter (700)
- Body: Inter (400)
- Monospace (for hashes): Fira Code

#### Components
- Buttons: Rounded corners (6px), elevation on hover
- Cards: Light shadow, white background, 8px radius
- Inputs: Border on focus, clear error states
- Badges: Small, colored, rounded pill shape
- Progress bars: Animated, gradient fill

#### Accessibility
- Minimum contrast ratio: 4.5:1
- Focus indicators on all interactive elements
- ARIA labels for icons
- Keyboard navigation support

---

## 8. DEVELOPMENT PHASES & TIMELINE

### Phase 1: MVP (Months 1-3)

**Month 1: Foundation**
- Environment setup
- Database schema design and creation
- Authentication service implementation
- User registration and login flows
- Basic frontend scaffolding

**Deliverables:**
- Working auth system
- Database with core tables
- Basic UI shell

**Month 2: Core Features**
- Project creation functionality
- Event ledger service implementation
- Hash chain logic
- Timeline display
- Document upload to object storage

**Deliverables:**
- Government employees can create projects
- Immutable timeline with hash verification
- Public can view projects

**Month 3: Public Features & Testing**
- Complaint submission and display
- Public analytics dashboard
- Admin correction workflow
- Comprehensive testing (unit, integration, E2E)
- Security audit
- Performance optimization

**Deliverables:**
- Fully functional MVP
- Test coverage >80%
- Documentation
- Deployment to staging

**MVP Scope:**
- Single language (English)
- Single region (Gujarat)
- Web-only (responsive)
- Basic analytics
- Email notifications only

### Phase 2: Production Hardening (Months 4-5)

**Month 4: Scaling & Security**
- Load testing and optimization
- Redis caching implementation
- Database read replicas
- Message queue setup
- Enhanced monitoring
- Security hardening

**Month 5: Admin Tools & Compliance**
- Enhanced admin panel
- Audit log improvements
- Advanced filtering and search
- Batch operations for admins
- Compliance documentation
- Disaster recovery setup

**Deliverables:**
- Production-ready platform
- Scalability tested to 10,000 users
- Full monitoring stack
- DR plan and backups

### Phase 3: Feature Enhancement (Months 6-8)

**Potential Features:**
- Multi-language support
- Advanced analytics with ML insights
- Mobile applications (React Native)
- Public API for developers
- Integration with existing government systems
- Blockchain timestamping
- Advanced search (Elasticsearch)
- Real-time notifications (WebSockets)

---

## 9. RISK ASSESSMENT & MITIGATION

### 9.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Hash chain corruption** | Critical | Low | Regular integrity checks, immutable table constraints, database triggers |
| **Database performance degradation** | High | Medium | Read replicas, caching layer, query optimization, indexing strategy |
| **Storage costs exceeding budget** | Medium | Medium | Document size limits, compression, lifecycle policies, cost alerts |
| **DDoS attacks** | High | Medium | CDN with DDoS protection, rate limiting, WAF |
| **Unauthorized data access** | Critical | Low | Multi-layer security, encryption, audit logging, MFA |
| **System downtime** | High | Low | Multi-AZ deployment, auto-scaling, health checks, failover |

### 9.2 Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Fake government employee registrations** | Medium | High | Manual admin verification, email domain validation, credential upload requirement |
| **Spam complaints** | Medium | Medium | Rate limiting, CAPTCHA, account verification, moderation tools |
| **Data retention legal issues** | Medium | Low | Legal consultation, clear privacy policy, GDPR-like controls |
| **Inadequate disaster recovery** | High | Low | Quarterly DR drills, documented procedures, automated backups |

### 9.3 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Low government adoption** | Critical | Medium | Government partnership, official endorsement, training programs |
| **Public mistrust** | High | Medium | Third-party audits, open-source codebase (consider), transparency reports |
| **Competing platforms** | Medium | Low | First-mover advantage, superior UX, official government backing |
| **Funding constraints** | Medium | Medium | Phased rollout, cost optimization, grant applications |

---

## 10. SUCCESS CRITERIA

### 10.1 Technical Metrics

**Performance:**
- API response time p95 < 500ms ✓
- Page load time < 2 seconds ✓
- Zero hash chain integrity failures ✓
- 99.9% uptime ✓

**Security:**
- Zero data breaches ✓
- Zero unauthorized access incidents ✓
- All security audits passed ✓

**Scalability:**
- Support 10,000 concurrent users ✓
- Handle 100 project creations/hour ✓
- Process 500 timeline events/hour ✓

### 10.2 Business Metrics

**Adoption (6 months):**
- 1,000+ registered government employees ✓
- 10,000+ projects listed ✓
- 100,000+ public users ✓
- 5,000+ complaints submitted ✓

**Engagement:**
- 50% of projects with weekly updates ✓
- 80% complaint response rate ✓
- 70% complaint resolution within 30 days ✓

**Trust:**
- 4+ star average user rating ✓
- <1% reported integrity concerns ✓
- Government official endorsement ✓

### 10.3 User Satisfaction

**Public Users:**
- 80% find platform easy to use ✓
- 75% trust the data presented ✓
- 60% would recommend to others ✓

**Government Employees:**
- 70% find project updates straightforward ✓
- 80% prefer this over manual reporting ✓

**Administrators:**
- 90% can verify users within 24 hours ✓
- Audit logs meet all requirements ✓

---

## 11. COMPLIANCE & LEGAL CONSIDERATIONS

### 11.1 Data Privacy
- Comply with Indian IT Act 2000 and amendments
- Clear privacy policy displayed
- User consent for data collection
- Right to access personal data
- Right to deletion (for personal info only, not public records)

### 11.2 Right to Information
- All project data public by default
- No paywalls for access
- Downloadable datasets (future)
- API access for transparency

### 11.3 Digital Signatures (Future)
- Integration with e-Sign
- Digital signatures for sanction orders
- Legal validity of electronic records

### 11.4 Accessibility
- Compliance with WCAG 2.1 Level AA
- Government accessibility standards

---

## 12. MAINTENANCE & SUPPORT

### 12.1 Support Tiers

**Tier 1: Public Users**
- FAQ documentation
- Help center articles
- Email support: support@transparency.gov.in
- Response time: 48 hours

**Tier 2: Government Employees**
- Dedicated support email: gov-support@transparency.gov.in
- Phone support during business hours
- Response time: 24 hours
- Training materials and videos

**Tier 3: Administrators**
- Priority support hotline
- Dedicated Slack channel
- Response time: 4 hours
- On-call support for critical issues

### 12.2 Maintenance Windows
- Scheduled: Sunday 2-4 AM IST
- Advance notice: 7 days
- Emergency maintenance: as needed with immediate notification

### 12.3 Documentation
- Technical documentation for developers
- API documentation (interactive, Swagger/OpenAPI)
- User guides with screenshots
- Video tutorials
- Admin runbooks

---

## 13. APPENDICES

### Appendix A: Glossary

- **Event Sourcing:** Pattern where state changes are stored as sequence of events
- **Hash Chain:** Cryptographic linking of records using hash functions
- **Immutable:** Cannot be changed after creation
- **JWT:** JSON Web Token, used for authentication
- **RBAC:** Role-Based Access Control
- **Ledger:** Append-only record of transactions
- **Genesis Event:** First event in a hash chain

### Appendix B: References

- Event Sourcing Pattern: Martin Fowler
- Cryptographic Hash Functions: SHA-256 specification
- REST API Design: OpenAPI Specification
- WCAG 2.1 Guidelines
- Indian IT Act 2000

### Appendix C: Stakeholder Contacts

- Product Owner: [Name/Department]
- Technical Lead: [Name]
- Security Officer: [Name]
- Government Liaison: [Name/Department]

### Appendix D: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Product Team | Initial PRD creation |

---

## APPROVAL SIGNATURES

**Product Owner:** _________________ Date: _______

**Technical Lead:** _________________ Date: _______

**Security Officer:** _________________ Date: _______

**Government Representative:** _________________ Date: _______

---

**END OF DOCUMENT**

*This PRD is a living document and will be updated as requirements evolve. All changes must be reviewed and approved by stakeholders.*