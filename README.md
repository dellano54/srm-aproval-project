# SRM-RMP Institutional Approval System

A comprehensive digital approval workflow system built with Next.js, TypeScript, MongoDB, and Tailwind CSS. This system streamlines institutional request approvals through a role-based workflow with real-time tracking and audit capabilities.

## ✨ Features Implemented

### Core Features
- ✅ **Next.js App Router** with TypeScript and Tailwind CSS
- ✅ **MongoDB Integration** with Mongoose ODM
- ✅ **Role-Based Authentication** (dev mode with 12 roles)
- ✅ **Multi-Stage Approval Workflow** with state machine logic
- ✅ **Real-Time Dashboard** with statistics and recent requests
- ✅ **Request Management** (create, track, approve/reject)
- ✅ **Budget Integration** with availability checks
- ✅ **SOP Reference System** with compliance tracking
- ✅ **Audit Trail** with comprehensive logging
- ✅ **Responsive Design** with modern UI components

### Advanced Features
- ✅ **Approval Engine** - Modular rules-based workflow system
- ✅ **Timeline Tracking** - Visual progress indicators
- ✅ **Search & Filtering** - Advanced request filtering
- ✅ **Role-Based Dashboards** - Customized views per role
- ✅ **Notification System** - In-app notifications (ready for webhooks)
- ✅ **Data Seeding** - Complete sample data for testing

### Technical Features
- ✅ **Server-Side API Routes** - No separate backend needed
- ✅ **Input Validation** with Zod schemas
- ✅ **Optimistic Updates** with SWR
- ✅ **Security** - Role guards and server-side data access
- ✅ **Scalable Architecture** - Clean separation of concerns

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB with Mongoose ODM
- **State Management**: SWR for data fetching
- **UI Components**: Headless UI, Heroicons
- **Forms**: React Hook Form with Zod validation

### Project Structure
```
├── app/
│   ├── api/                 # API routes
│   ├── dashboard/           # Dashboard pages
│   ├── login/              # Authentication
│   └── globals.css         # Global styles
├── components/             # Reusable UI components
├── lib/
│   ├── auth.ts            # Authentication utilities
│   ├── approval-engine.ts  # Workflow logic
│   ├── mongodb.ts         # Database connection
│   └── types.ts           # TypeScript definitions
├── models/                # Mongoose schemas
├── scripts/
│   └── seed.ts            # Database seeding
└── public/                # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd srmp-approval
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/srmp-approval
NEXT_PUBLIC_APP_NAME=SRM-RMP Institutional Approval
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-here
UPLOAD_DIR=./public/uploads
```

3. **Database Seeding**
```bash
npm run seed
```

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Default Login Credentials (Dev Mode)

The system includes a dev-only authentication system. Visit `/login` and select any role:

| Role | Email | Access Level |
|------|-------|-------------|
| Requester | requester@srm.edu | Create requests |
| Institution Manager | institution_manager@srm.edu | Review requests, SOP checks |
| Accountant | accountant@srm.edu | Budget verification |
| VP | vp@srm.edu | Vice President approval |
| Head of Institution | head_of_institution@srm.edu | HOI approval |
| Dean | dean@srm.edu | Dean review and verification |
| MMA/HR/Audit/IT | mma@srm.edu | Department checks |
| Chief Director | chief_director@srm.edu | Senior approval |
| Chairman | chairman@srm.edu | Final approval |

## 📊 Approval Workflow

### Standard Flow (Budget Available)
```
Request Created → Manager Review → Budget Check ✅ → VP → HOI → Dean → Dept. Checks → Dean Verification → Chief Director → Chairman → Approved
```

### Special Flow (Budget Not Available)
```
Request Created → Manager Review → Budget Check ❌ → Dean Review → Chairman → Approved/Rejected
```

### Workflow States
- **Draft** - Initial creation
- **Submitted** - Ready for manager review
- **Manager Review** - SOP compliance check
- **Budget Check** - Financial verification
- **VP Approval** - Vice President review
- **HOI Approval** - Head of Institution approval
- **Dean Review** - Dean assessment
- **Department Checks** - MMA/HR/Audit/IT verification
- **Dean Verification** - Final dean approval
- **Chief Director Approval** - Senior management approval
- **Chairman Approval** - Board approval
- **Approved/Rejected** - Final status

## 🔌 API Endpoints

### Authentication
```bash
POST /api/auth/dev-login    # Dev login
GET  /api/auth/me          # Get current user
POST /api/auth/logout      # Logout
```

### Requests
```bash
GET  /api/requests         # List requests (with filters)
POST /api/requests         # Create request
GET  /api/requests/[id]    # Get single request
POST /api/requests/[id]/actions  # Approve/reject/clarify
```

### Dashboard & Data
```bash
GET  /api/dashboard/stats  # Dashboard statistics
GET  /api/budgets         # Budget records
POST /api/budgets/check   # Check budget availability
GET  /api/sop            # SOP records
GET  /api/audit          # Audit logs
```

### Example API Calls

**Create a Request**
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Equipment Request",
    "purpose": "Need new laptops for development team",
    "college": "Engineering",
    "department": "Computer Science", 
    "costEstimate": 50000,
    "expenseCategory": "Equipment",
    "sopReference": "SOP-001"
  }'
```

**Approve a Request**
```bash
curl -X POST http://localhost:3000/api/requests/[id]/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "notes": "Approved for immediate procurement"
  }'
```

## 🧪 Testing

The project includes Jest and React Testing Library setup for testing:

```bash
npm test        # Run tests in watch mode
npm run test:ci # Run tests once
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Environment Variables**
Set these in Vercel dashboard:
- `MONGODB_URI`
- `NEXT_PUBLIC_APP_NAME`  
- `NEXT_PUBLIC_BASE_URL`
- `JWT_SECRET`

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify  
- Railway
- Render

## 📈 Future Enhancements

### Ready-to-Implement Features
- **NextAuth Integration** - Replace dev auth with production-ready auth
- **Email Notifications** - SMTP integration for email alerts
- **File Uploads** - Complete file attachment system  
- **PDF Generation** - Server-side PDF export
- **Push Notifications** - Real-time browser notifications
- **Advanced Analytics** - Detailed reporting dashboard
- **Mobile App** - React Native companion app

### Webhook Integration
The system includes webhook stubs:
```javascript
// Ready for external integrations
POST /api/webhooks/notify  // External notification system
POST /api/webhooks/budget  // ERP budget sync
```

## 🛠️ Development

### Database Schema
The system uses 6 main collections:
- **Users** - User profiles and roles
- **Requests** - Approval requests with full history
- **BudgetRecords** - Financial allocations and spending
- **SOPRecords** - Standard Operating Procedures  
- **AuditLogs** - Complete audit trail
- **ApprovalHistory** - Embedded request timeline

### Custom Hooks & Utilities
- `useAuth()` - Authentication state management
- `approvalEngine` - Workflow state machine
- `useSWR` - Optimistic data fetching
- Role guards and permission checks

### Code Quality
- TypeScript for type safety
- ESLint for code consistency  
- Tailwind for styling consistency
- Modular component architecture

## 📝 Changelog

### v1.0.0 - Initial Release
- ✅ Complete approval workflow system
- ✅ Role-based authentication and authorization
- ✅ MongoDB integration with comprehensive schemas
- ✅ Modern UI with Tailwind CSS
- ✅ Real-time dashboards and statistics
- ✅ Audit logging and compliance tracking
- ✅ Budget management integration
- ✅ SOP reference system
- ✅ Responsive design for all devices
- ✅ Development tools and seeding scripts

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)  
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Built with ❤️ for SRM-RMP Institutional Approval System**