# GRN Transfer System

> A modern web application for managing internal stock transfer receipts between warehouses and stores for Food Concepts PLC (Chicken Republic).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff)](https://vitejs.dev/)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.145-ff4154)](https://tanstack.com/router)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.90-ff4154)](https://tanstack.com/query)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Development](#development)
- [Building](#building)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🎯 Overview

The GRN Transfer System is a comprehensive inventory management solution that streamlines the goods receipt process for internal stock transfers at Food Concepts PLC (Chicken Republic) restaurants. The system manages the complete lifecycle of transfer order receipts from creation through approval.

**Key Workflows:**

1. **Create GRN**: Store staff record received quantities from warehouse transfers
2. **Approval Process**: Supply Chain Department (SCD) reviews and approves/rejects receipts
3. **Rejection Handling**: Stores can edit and resubmit rejected receipts
4. **History & Reporting**: Comprehensive filtering and export capabilities

**System Integrations:**

- **Azure Active Directory** - Enterprise SSO authentication
- **SAP Business ByDesign** - ERP system for delivery orders (via middleware API)
- **ICG HQ** - Centralized inventory posting

## ✨ Features

### 🔐 Authentication & Security

- **Azure AD SSO**: Enterprise single sign-on integration
- **Automatic Token Refresh**: Seamless token renewal on expiration
- **Protected Routes**: Authentication guards on all protected pages
- **Role-Based Access**: Restaurant Manager and SCD role permissions
- **Persistent Auth State**: Maintains login across page refreshes

### 📦 Create GRN (Store Staff)

- **Delivery Search**: Fetch transfer orders by Delivery ID (GTN number)
- **Quantity Input**: Record received quantities with unlimited decimal precision
- **Outstanding Tracking**: Automatic calculation of outstanding quantities
- **Partial Receipts**: Support for multiple partial receipts per delivery
- **Real-time Validation**: Ensures received ≤ outstanding quantities
- **PDF Preview**: Generate and download GRN preview before submission
- **Success Confirmation**: Dialog notification to await SCD approval

### ✅ Approval Workflow (SCD Role)

- **Pending Queue**: View all receipts awaiting approval
- **Variance Detection**: Automatic calculation and highlighting of variances >5%
- **Approve/Reject**: Two-step confirmation for approval decisions
- **Rejection Reasons**: Mandatory reason field for rejections
- **SAP Sync**: Approved receipts automatically synced to SAP
- **ICG Posting**: Inventory updates posted to ICG system

### 🔄 Rejection & Resubmission

- **Rejection Banner**: Clear display of rejection reason and count
- **Edit Capability**: Restaurant Managers can edit rejected receipts
- **Quantity Adjustment**: Update received quantities with validation
- **Resubmission Flow**: Edited receipts return to pending approval queue
- **Audit Trail**: Track rejection count and history

### � History & Reporting

- **Advanced Filters**:
  - Delivery ID (GTN number)
  - Source Location
  - Delivery Date Range (from/to)
  - Delivery Status
  - Sales Order Reference
- **Expandable Rows**: View line item details inline
- **Pagination**: Configurable page sizes (10, 20, 50, 100)
- **Export**: Download filtered results as Excel/CSV
- **Store-Specific Reports**: Scoped to user's assigned store

### 🎨 Modern UI/UX

- **Responsive Design**: Tailwind CSS with mobile-first approach
- **shadcn/ui Components**: Accessible Radix UI primitives
- **Collapsible Sidebar**: Persistent navigation with route highlighting
- **Toast Notifications**: Real-time feedback with Sonner
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages

### 🔢 Precision Handling

- **Unlimited Decimals**: Support for quantities like 84.60001234
- **Float Artifact Stripping**: Automatic cleanup (11.129999999999995 → 11.13)
- **formatQty Utility**: Consistent quantity formatting across the app

## 🛠 Tech Stack

### Frontend Core

- **React 19.2.0** - UI library with latest features
- **TypeScript 5.9.3** - Type safety and developer experience
- **Vite 7.2.4** - Lightning-fast build tool and dev server
- **TanStack Router 1.145.7** - File-based routing with code splitting
- **TanStack Query 5.90.16** - Powerful server state management
- **Zustand 5.0.9** - Lightweight global state management

### UI & Styling

- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library (Radix UI primitives)
- **Lucide React 0.562.0** - Beautiful icon library
- **Framer Motion 12.24.10** - Animation library
- **Sonner 2.0.7** - Toast notifications

### Forms & Validation

- **React Hook Form 7.70.0** - Performant form management
- **Zod 4.3.5** - TypeScript-first schema validation
- **@hookform/resolvers 5.2.2** - Form validation integration

### Data & Utilities

- **TanStack Table 8.21.3** - Headless table library
- **date-fns 4.1.0** - Modern date utility library
- **jsPDF 4.0.0** - PDF generation
- **jspdf-autotable 5.0.7** - PDF table generation
- **use-debounce 10.0.4** - Debounced values and callbacks

### Authentication

- **MSAL Browser 4.27.0** - Microsoft Authentication Library
- **MSAL React 3.0.23** - React wrapper for MSAL
- **Azure AD** - Enterprise identity provider
- **jwt-decode 4.0.0** - JWT token decoding

### API & Integration

- **Axios 1.13.2** - Promise-based HTTP client
- **SAP Business ByDesign** - ERP system (via middleware)
- **ICG HQ** - Inventory control system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Azure AD application credentials
- Access to backend API

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd grn-local
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Update `.env.local` with your credentials**

   ```env
   # Azure AD Configuration
   VITE_MSAL_CLIENT_ID=your-azure-client-id
   VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
   VITE_MSAL_REDIRECT_URI=http://localhost:5173
   VITE_MSAL_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
   VITE_MSAL_SCOPE=api://your-api-scope/.default
   
   # API Configuration
   VITE_API_BASE_URL=https://api.example.com
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── assets/
│   └── images/              # Company logos, backgrounds
├── components/
│   ├── ui/                  # shadcn/ui base components (45 items)
│   ├── create-grn-*.tsx     # GRN creation workflow components
│   ├── view-grn-*.tsx       # GRN approval workflow components
│   ├── grn-history-*.tsx    # History and filtering components
│   ├── delivery-*.tsx       # Delivery detail components
│   └── pending-approvals-view.tsx
├── hooks/
│   └── use-auth.ts          # Authentication state and methods
├── layout/
│   ├── app-sidebar.tsx      # Main navigation sidebar
│   └── header.tsx           # Page header with user menu
├── lib/
│   ├── api/
│   │   ├── auth.ts          # Auth mutations (login/logout)
│   │   ├── transfers.ts     # Delivery & receipt API hooks
│   │   └── egrn.ts          # e-GRN specific endpoints
│   ├── axios.ts             # Axios with MSAL interceptor
│   ├── msal.ts              # MSAL configuration & singleton
│   ├── query-client.ts      # TanStack Query configuration
│   ├── constants.ts         # Company info constants
│   └── utils.ts             # Utilities (cn, formatQty, etc.)
├── routes/
│   ├── __root.tsx           # Root layout with providers
│   ├── index.tsx            # Landing/portal selection page
│   └── _protected/          # Protected routes (auth required)
│       ├── route.tsx        # Auth guard & layout
│       ├── create-grn/      # Create GRN workflow
│       ├── grn-history/     # GRN history with filters
│       ├── store-report/    # Store-specific reporting
│       ├── delivery/        # Delivery detail & edit
│       └── view-grn/        # Approval workflows (SCD)
├── types/
│   └── index.d.ts           # Global TypeScript interfaces
├── index.css                # Global styles & Tailwind
├── main.tsx                 # Application entry point
└── routeTree.gen.ts         # Auto-generated route tree
```

## 🔐 Authentication

### Azure AD Configuration

1. Register application in Azure AD
2. Configure redirect URIs
3. Set API permissions:
   - `User.Read` (Microsoft Graph)
   - Custom API scope
4. Copy Client ID and Tenant ID to `.env`

### Authentication Flow

```
User → Landing Page → Portal Selection → Azure AD Login (MSAL)
  → Token Acquisition → Protected Routes → API Calls with Bearer Token
```

**Key Implementation Details:**

- MSAL instance initialized in `main.tsx` before app render
- `handleRedirectPromise()` called to process OAuth redirects
- Active account set from `getAllAccounts()` to persist auth state
- Protected routes check authentication in `beforeLoad` hook
- Axios interceptor automatically injects Bearer token
- Token refresh handled automatically on 401 responses

### Usage in Components

```typescript
import { useAuth } from "@/hooks/use-auth"

function MyComponent() {
  const { isAuthenticated, user, getRoles, getAccessToken, login, logout } = useAuth()
  
  // Check authentication
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  // Access user info
  console.log(user?.name, user?.email)
  
  // Check roles
  const roles = getRoles()
  const isSCD = roles.includes('SCD')
  
  // Component logic
}
```

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting (if configured)
- **Conventional Commits**: Commit message format

### Adding New Routes

1. Create file in `src/routes/` following TanStack Router conventions
2. Use `createFileRoute` to define route
3. Add to sidebar navigation in `app-sidebar.tsx`
4. Run dev server to auto-generate route tree

```typescript
// src/routes/_protected/my-page/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/my-page/')({
  component: MyPage,
})

function MyPage() {
  // Use TanStack Query for data fetching
  const { data, isLoading } = useMyDataQuery()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>My Page</h1>
      {/* Page content */}
    </div>
  )
}
```

### Adding API Hooks

```typescript
// src/lib/api/my-api.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"
import { toast } from "sonner"

// Query (GET)
export const useMyDataQuery = ({ id }: { id: number }) => {
  return useQuery({
    queryKey: ["my-data", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/my-data/${id}`)
      return data as IMyData
    },
    enabled: !!id,  // Only run if id exists
  })
}

// Mutation (POST/PATCH/DELETE)
export const useCreateMyDataMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (payload: IMyDataPayload) => {
      const { data } = await axiosInstance.post("/api/my-data", payload)
      return data
    },
    onSuccess: () => {
      // Invalidate related queries to refetch
      queryClient.invalidateQueries({ queryKey: ["my-data"] })
      toast.success("Data created successfully")
    },
    onError: (error) => {
      const message = extractErrorMessage(error)
      toast.error(message)
    },
  })
}
```

## 🏗 Building

### Production Build

```bash
npm run build
```

Output: `dist/` directory

### Environment-Specific Builds

```bash
# Development
VITE_ENV=development npm run build

# Staging
VITE_ENV=staging npm run build

# Production
VITE_ENV=production npm run build
```

### Subfolder Deployment

This application is configured for deployment to the `/grn-transfer/` subfolder.

**Configuration Files:**

1. **`vite.config.ts`**: Set `base: "/grn-transfer/"`
2. **`main.tsx`**: Set `basepath: "/grn-transfer"`
3. **`public/.htaccess`**: Apache rewrite rules for SPA routing

**Deployment Steps:**

```bash
# Build for production
npm run build

# Upload dist/ contents to /grn-transfer/ folder on server
# Ensure .htaccess is included
```

**Hosting Options:**

- **Apache Server** (recommended) - Supports `.htaccess` rewrite rules
- **Nginx** - Requires manual rewrite configuration
- **Azure Static Web Apps**
- **Netlify** / **Vercel** - Configure redirects

**Important:**
- HTTPS is required for Azure AD authentication
- Update `VITE_MSAL_REDIRECT_URI` to production URL
- Ensure `.htaccess` is deployed with build artifacts

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Comprehensive system architecture, data flows, and integration points
- **[.env.example](./.env.example)** - Environment variable template (if exists)

### Key Concepts

**Quantity Precision:**
```typescript
// formatQty utility in src/lib/utils.ts
formatQty(84.6 - 73.47)  // 11.129999999999995 → "11.13"
formatQty(84.60001234)   // → "84.60001234" (preserves precision)
```

**Outstanding Calculation:**
```typescript
// For new receipts
outstanding = quantity_expected - quantity_received

// For partial receipts (multiple submissions)
outstanding = quantity_expected - sum(approved_receipts.quantity_received)

// For editing rejected receipt
outstanding = quantity_expected - sum(approved_receipts_excluding_current)
```

**Approval States:**
- `receipt_submitted` - Awaiting SCD approval
- `approved` - Approved by SCD, synced to SAP
- `rejected` - Rejected by SCD, can be edited and resubmitted
- `resubmitted` - Edited after rejection, awaiting re-approval

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Make changes following code style guidelines
3. Test thoroughly
4. Commit using conventional commits
5. Create pull request

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:

```
feat(stock-movement): add e-GTN search functionality

- Implement search input and API integration
- Add error handling for not found cases
- Display e-GTN details in table format
```

## 📄 License

Proprietary - Food Concepts plc © 2025

## 👥 Team

Development Team - Food Concepts plc

## 📞 Support

For issues, questions, or feature requests, please contact the development team.

---

**Built with ❤️ for Food Concepts plc**
