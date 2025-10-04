# Request Creation Feature

## Overview
The request creation feature allows users with the "Requester" role to create new approval requests within the SRM-RMP Institutional Approval System. This feature provides a form-based interface for submitting requests with all necessary details.

## Access
- URL: `/dashboard/requests/create`
- Role Required: Requester/HOD
- Authentication: JWT token required

## Form Fields
The request creation form includes the following fields:

1. **Title** (Required)
   - Minimum 5 characters
   - Brief descriptive title for the request

2. **Purpose** (Required)
   - Minimum 10 characters
   - Detailed explanation of the request purpose

3. **College** (Required)
   - Text input for college name

4. **Department** (Required)
   - Text input for department name

5. **Cost Estimate** (Required)
   - Numeric value in Indian Rupees (₹)
   - Must be greater than 0

6. **Expense Category** (Required)
   - Text input for categorizing the expense

7. **SOP Reference** (Optional)
   - Text input for referencing Standard Operating Procedures

## Validation
All form fields are validated both on the client-side and server-side using Zod schema validation. The validation rules are defined in the [CreateRequestSchema](file:///Users/user/Workspace/Projects/Research/SRM_Approval_System/SRM_APPROVAL/lib/types.ts#L52-L61) in [lib/types.ts](file:///Users/user/Workspace/Projects/Research/SRM_Approval_System/SRM_APPROVAL/lib/types.ts).

## API Endpoints
- **POST** `/api/requests` - Create a new request
  - Requires authentication
  - Accepts JSON payload with all form fields
  - Returns the created request object

## Workflow
1. User navigates to `/dashboard/requests/create`
2. User fills in all required fields
3. User submits the form
4. Form data is validated
5. Request is created in the database with DRAFT status
6. User is redirected to the request detail page

## Components
- Frontend: [app/dashboard/requests/create/page.tsx](file:///Users/user/Workspace/Projects/Research/SRM_Approval_System/SRM_APPROVAL/app/dashboard/requests/create/page.tsx)
- API Route: [app/api/requests/route.ts](file:///Users/user/Workspace/Projects/Research/SRM_Approval_System/SRM_APPROVAL/app/api/requests/route.ts)
- Model: [models/Request.ts](file:///Users/user/Workspace/Projects/Research/SRM_Approval_System/SRM_APPROVAL/models/Request.ts)
- Validation Schema: [lib/types.ts](file:///Users/user/Workspace/Projects/Research/SRM_Approval_System/SRM_APPROVAL/lib/types.ts) (CreateRequestSchema)

## Preview Option
The request creation form includes a preview option that allows users to review their request before submission. This feature helps ensure all information is accurate before the request enters the approval workflow.