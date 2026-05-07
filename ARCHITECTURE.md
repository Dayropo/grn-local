# System Architecture

## Overview

The Goods Receipt Note (GRN) Transfer System is a web-based application built for Food Concepts PLC (Chicken Republic) to manage internal stock transfers between warehouses and stores. The system handles the complete lifecycle of goods receipt from transfer order creation to approval, integrating with Microsoft Azure Active Directory for authentication and SAP Business ByDesign for ERP operations.

## Technology Stack

### Frontend

- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Routing**: TanStack Router 1.145.7 (file-based routing with code splitting)
- **State Management**:
  - TanStack Query 5.90.16 (React Query) for server state
  - Zustand 5.0.9 for global client state
  - React hooks for local component state
- **Form Management**:
  - React Hook Form 7.70.0
  - Zod 4.3.5 for schema validation
  - @hookform/resolvers 5.2.2
- **UI Framework**:
  - Tailwind CSS 4.1.18
  - shadcn/ui (Radix UI primitives)
  - Lucide React 0.562.0 for icons
  - Framer Motion 12.24.10 for animations
- **Data Visualization**:
  - TanStack Table 8.21.3 for data tables
  - Recharts 2.15.4 for charts
- **PDF Generation**:
  - jsPDF 4.0.0
  - jspdf-autotable 5.0.7
- **Date Handling**: date-fns 4.1.0
- **Authentication**: MSAL Browser 4.27.0 & MSAL React 3.0.23 for Azure AD
- **Notifications**: Sonner 2.0.7 for toast notifications

### Backend Integration

- **API Client**: Axios 1.13.2 with MSAL token interceptors
- **Authentication**: Azure AD Enterprise SSO
- **ERP System**: SAP Business ByDesign (via middleware API)
- **Token Management**: JWT decode 4.0.0

## Project Structure

```
grn-local/
├── public/
│   ├── .htaccess                    # Apache rewrite rules for SPA routing
│   └── [static assets]              # Favicon, robots.txt, etc.
├── src/
│   ├── assets/
│   │   └── images/                  # Company logos, backgrounds
│   │       └── index.ts             # Centralized image exports
│   ├── components/
│   │   ├── ui/                      # shadcn/ui base components (45 items)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── [other UI primitives]
│   │   ├── create-grn-confirm-view.tsx      # GRN creation confirmation step
│   │   ├── create-grn-preview-view.tsx      # GRN preview before submission
│   │   ├── create-grn-search-form.tsx       # Delivery search form
│   │   ├── create-grn-delivery-table.tsx    # Delivery listing table
│   │   ├── view-grn-detail-view.tsx         # GRN detail view for approvals
│   │   ├── view-grn-list-view.tsx           # GRN list with filters
│   │   ├── view-grn-search-form.tsx         # GRN search filters
│   │   ├── pending-approvals-view.tsx       # Pending approval queue
│   │   ├── delivery-detail-row.tsx          # Expandable delivery line items
│   │   ├── grn-history-filter-form.tsx      # History page filters
│   │   ├── date-range-picker.tsx            # Date range selection component
│   │   ├── pagination.tsx                   # Reusable pagination
│   │   ├── table-skeleton.tsx               # Loading skeleton for tables
│   │   └── [dialogs and utilities]
│   ├── hooks/
│   │   ├── use-auth.ts                      # Authentication state & methods
│   │   └── [other custom hooks]
│   ├── layout/
│   │   ├── app-sidebar.tsx                  # Main navigation sidebar
│   │   └── header.tsx                       # Page header with user menu
│   ├── lib/
│   │   ├── api/
│   │   │   ├── auth.ts                      # Auth mutations (login/logout)
│   │   │   ├── transfers.ts                 # Delivery & receipt API hooks
│   │   │   ├── egrn.ts                      # e-GRN specific endpoints
│   │   │   └── index.ts
│   │   ├── axios.ts                         # Axios instance with MSAL interceptor
│   │   ├── msal.ts                          # MSAL configuration & singleton
│   │   ├── query-client.ts                  # TanStack Query configuration
│   │   ├── constants.ts                     # Company info constants
│   │   └── utils.ts                         # Utility functions (cn, formatQty, etc.)
│   ├── routes/
│   │   ├── __root.tsx                       # Root layout with providers
│   │   ├── index.tsx                        # Landing/portal selection page
│   │   └── _protected/                      # Protected routes (auth required)
│   │       ├── route.tsx                    # Auth guard & protected layout
│   │       ├── create-grn/
│   │       │   └── index.tsx                # Create GRN workflow
│   │       ├── grn-history/
│   │       │   └── index.tsx                # GRN history with filters
│   │       ├── store-report/
│   │       │   └── index.tsx                # Store-specific GRN report
│   │       ├── delivery/
│   │       │   └── $deliveryId/
│   │       │       └── index.tsx            # Delivery detail & edit
│   │       └── view-grn/
│   │           ├── search/
│   │           │   └── index.tsx            # Search GRNs for approval
│   │           ├── pending-approvals/
│   │           │   └── index.tsx            # Approval queue (SCD role)
│   │           ├── detail/
│   │           │   └── $receiptId.tsx       # GRN approval detail
│   │           └── history/
│   │               └── index.tsx            # Approved GRN history
│   ├── types/
│   │   └── index.d.ts                       # Global TypeScript interfaces
│   ├── index.css                            # Global styles & Tailwind imports
│   ├── main.tsx                             # Application entry point
│   └── routeTree.gen.ts                     # Auto-generated route tree
├── .env.local                               # Environment variables (not in git)
├── .htaccess                                # Production Apache config
├── package.json                             # Dependencies & scripts
├── tsconfig.json                            # TypeScript configuration
├── vite.config.ts                           # Vite build configuration
├── tailwind.config.ts                       # Tailwind CSS configuration
└── README.md                                # Project documentation
```

## Architecture Patterns

### 1. Authentication Flow

```
User → Landing Page → Portal Selection → Azure AD Login (MSAL) 
  → Token Acquisition → Protected Routes → API Calls with Bearer Token
```

**Implementation Details:**

**MSAL Configuration (`lib/msal.ts`):**
```typescript
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: import.meta.env.VITE_MSAL_AUTHORITY,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_MSAL_POST_LOGOUT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage",  // Persist auth state
    storeAuthStateInCookie: false,
  },
}
```

**Initialization (`main.tsx`):**
```typescript
const msalInstance = getMsalInstance()
await msalInstance.initialize()
await msalInstance.handleRedirectPromise()  // Process OAuth redirect

const accounts = msalInstance.getAllAccounts()
if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
  msalInstance.setActiveAccount(accounts[0])  // Restore active account
}
```

**Key Components:**
- `getMsalInstance()`: Singleton function returning global MSAL PublicClientApplication
- `useAuth`: Hook providing `isAuthenticated`, `user`, `getRoles`, `getAccessToken`, `login`, `logout`
- Axios Interceptor: Automatically injects Bearer token into all API requests
- Token Refresh: Automatic silent token renewal on 401 responses

### 2. Route Protection

**File-based routing with auth guards:**

**Protected Route Layout (`_protected/route.tsx`):**
```typescript
export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const msalInstance = getMsalInstance()
    await msalInstance.initialize()
    await msalInstance.handleRedirectPromise()
    const accounts = msalInstance.getAllAccounts()
    const isAuthenticated = accounts.length > 0

    if (!isAuthenticated) {
      throw redirect({
        to: "/",
        search: { redirect: window.location.pathname },
      })
    }
  },
  component: ProtectedLayout,
})
```

**Features:**
- All routes under `_protected/` require authentication
- Unauthenticated users redirected to landing page with return URL
- Auth state checked on every protected route navigation
- MSAL initialization awaited to prevent race conditions on page refresh

### 3. Data Fetching Pattern

**TanStack Query (React Query) for all API operations:**

```typescript
// Query (GET) - Deliveries with filters
export const useDeliveriesQuery = ({
  page, size, source_location_id, destination_store,
  delivery_date_from, delivery_date_to, delivery_status_code
}) => {
  return useQuery({
    queryKey: ["transfers", "deliveries", page, size, /* ...filters */],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/transfers/v1/deliveries/", {
        params: { page, size, /* ...filters */ }
      })
      return data as IPaginatedResponse<IDelivery>
    },
  })
}

// Mutation (POST) - Create delivery receipt
export const useCreateDeliveryReceiptMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateDeliveryReceiptPayload) => {
      const { data } = await axiosInstance.post(
        "/transfers/v1/delivery-receipts/", 
        payload
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers", "deliveries"] })
    },
  })
}

// Mutation (PATCH) - Update receipt (for rejected receipts)
export const useUpdateDeliveryReceiptMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ receiptId, line_items, notes }) => {
      const { data } = await axiosInstance.patch(
        `/transfers/v1/delivery-receipts/${receiptId}/`,
        { line_items, notes }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] })
    },
  })
}
```

**Query Features:**
- Automatic caching with configurable stale time
- Background refetching for fresh data
- Optimistic updates for mutations
- Query invalidation on successful mutations
- Loading and error states built-in
- Debounced search queries with `use-debounce`

### 4. Component Architecture

**Separation of concerns:**

- **Route Components** (`src/routes/`): Page-level components with data fetching
- **View Components** (`src/components/*-view.tsx`): Complex UI sections (search, preview, detail)
- **Form Components** (`src/components/*-form.tsx`): Form logic with React Hook Form + Zod
- **Layout Components** (`src/layout/`): Shared layouts (sidebar, header)
- **UI Primitives** (`src/components/ui/`): Reusable shadcn/ui components
- **Business Logic** (`src/lib/api/`, `src/hooks/`): API hooks and custom hooks
- **Utilities** (`src/lib/utils.ts`): Helper functions (formatQty, cn, error extraction)

## Core Features

### 1. Create GRN (Goods Receipt Note)

**Purpose**: Record receipt of goods from warehouse transfers

**Workflow:**

1. **Search Delivery**
   - Enter Delivery ID (GTN number)
   - System fetches delivery details from SAP via API
   - Displays delivery header and line items

2. **Confirm Receipt Quantities**
   - View expected quantities per line item
   - View outstanding quantities (expected - previously received)
   - Input received quantities with full decimal precision
   - System validates: received ≤ outstanding
   - Add optional notes for partial receipts

3. **Preview GRN**
   - Review all line items with quantities
   - View quantity summary (Expected, Received, Outstanding)
   - Print or download PDF preview
   - Checkbox confirmation required

4. **Submit GRN**
   - Creates delivery receipt record
   - Status: "Pending Approval" (awaits SCD confirmation)
   - Success dialog: "Kindly await confirmation from SCD"
   - Redirects to GRN History

**Features:**
- Unlimited decimal precision for quantities (e.g., 84.60001234)
- Float artifact stripping (e.g., 11.129999999999995 → 11.13)
- Partial receipt support with outstanding tracking
- PDF generation with company branding
- Real-time validation

### 2. GRN History

**Purpose**: View and filter historical GRN records for the logged-in user's store

**Features:**
- **Filters:**
  - Delivery ID (GTN number)
  - Source Location
  - Delivery Date Range (from/to)
  - Delivery Status
  - Sales Order Reference
- **Table Columns:**
  - GTN Number
  - Source Location
  - Destination Store
  - Expected Qty
  - Received Qty
  - Delivery Date
  - Status
  - Actions (View Details, Export)
- **Expandable Rows:** Click to view line item details
- **Pagination:** Configurable page size (10, 20, 50, 100)
- **Export:** Download filtered results as Excel/CSV

### 3. Store Report

**Purpose**: Store-specific GRN reporting with same filters as GRN History

**Features:**
- Identical to GRN History but scoped to specific store
- Date range filtering
- Export capabilities

### 4. Delivery Detail & Edit

**Purpose**: View delivery details and edit rejected receipts

**Features:**
- **View Mode:**
  - Delivery header information
  - Line items table with quantities
  - Quantity summary cards
  - Receipt history with approval status
  - PDF download

- **Edit Mode** (for rejected receipts - Restaurant Manager role):
  - Editable quantity inputs
  - Validation against outstanding quantities
  - Notes field for resubmission
  - Save triggers re-approval workflow
  - Success dialog: "Await SCD confirmation"

**Rejection Handling:**
- Displays rejection banner with reason
- Shows rejection count
- Allows quantity edits
- Resubmits for approval

### 5. View GRN (Approval Workflow - SCD Role)

**Purpose**: Supply Chain Department approval queue

#### 5.1 Search GRN
- Search by Delivery ID, date range, status
- View list of submitted receipts

#### 5.2 Pending Approvals
- Queue of receipts awaiting approval
- Displays: Receipt #, GTN, Source, Destination, Quantities, Date, Status
- Expandable rows for line item details

#### 5.3 GRN Detail (Approval)
- Full receipt details with line items
- Variance calculation (expected vs received)
- Variance warnings (>5% highlighted)
- **Actions:**
  - **Approve:** Marks receipt as approved, syncs to SAP
  - **Reject:** Requires rejection reason, sends back to store
- Checkbox confirmation required

#### 5.4 Approval History
- View approved/rejected GRN records
- Filter by date, status, store

## Data Flow

### GRN Creation & Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STORE (Restaurant Manager)                                      │
└─────────────────────────────────────────────────────────────────┘
1. User searches Delivery ID (GTN)
   ↓
2. GET /transfers/v1/deliveries/?delivery_id={id}
   ← Returns: IDelivery with line_items, receipts, metadata
   ↓
3. User inputs received quantities per line item
   - Validates: quantity_received ≤ quantity_outstanding
   - Calculates: outstanding = expected - (previous_received + new_received)
   ↓
4. User previews GRN
   - Displays summary: Expected, Received, Outstanding
   - Generates PDF preview (jsPDF + autotable)
   ↓
5. User confirms and submits
   ↓
6. POST /transfers/v1/delivery-receipts/
   Body: {
     delivery: number,
     line_items: [{ delivery_line_item, quantity_received }],
     notes: string
   }
   ← Returns: IDeliveryReceipt (status: "receipt_submitted")
   ↓
7. Success Dialog: "Await SCD confirmation"
   → Navigate to /grn-history

┌─────────────────────────────────────────────────────────────────┐
│ SCD (Supply Chain Department)                                   │
└─────────────────────────────────────────────────────────────────┘
8. GET /transfers/v1/pending-approvals/
   ← Returns: IPaginatedResponse<IPendingApproval>
   ↓
9. SCD reviews receipt details
   - Variance check: (received - expected) / expected * 100
   - Highlights variances > 5%
   ↓
10. SCD Decision:
    
    ┌─ APPROVE ─────────────────────────────────────────┐
    │ POST /transfers/v1/delivery-receipts/{id}/approve/ │
    │ ← Updates: approval_status = "approved"            │
    │ ← Triggers: SAP sync, ICG posting                  │
    └────────────────────────────────────────────────────┘
    
    ┌─ REJECT ──────────────────────────────────────────┐
    │ POST /transfers/v1/delivery-receipts/{id}/reject/  │
    │ Body: { rejection_reason: string }                 │
    │ ← Updates: approval_status = "rejected"            │
    │ ← Increments: rejection_count                      │
    │ → Store can edit and resubmit                      │
    └────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ RESUBMISSION (After Rejection)                                  │
└─────────────────────────────────────────────────────────────────┘
11. Store views delivery detail
    - Shows rejection banner with reason
    - "Edit" button visible (Restaurant Manager only)
    ↓
12. User edits quantities
    - Validates against outstanding (excluding rejected receipt)
    ↓
13. PATCH /transfers/v1/delivery-receipts/{id}/
    Body: {
      line_items: [{ line_item_id, quantity_received }],
      notes: string
    }
    ← Updates receipt, resets to "resubmitted" status
    ↓
14. Success Dialog: "Await SCD confirmation"
    → Navigate to /grn-history
    → SCD sees updated receipt in pending queue
```

### Key Data Transformations

**Quantity Precision Handling:**
```typescript
// formatQty utility strips float artifacts
formatQty(84.6 - 73.47)  // 11.129999999999995 → "11.13"
formatQty(84.60001234)   // → "84.60001234" (preserves precision)
formatQty(0)             // → "0"
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

## Integration Points

### 1. SAP Business ByDesign (via Middleware API)

**Endpoints:**
- `GET /transfers/v1/deliveries/` - Fetch delivery/transfer orders
- `GET /transfers/v1/deliveries/{id}/` - Fetch single delivery details
- Includes SAP metadata: `IDeliveryMetadata`, `IDeliveryLineItemMetadata`

**Data Synchronization:**
- Delivery orders synced from SAP to middleware
- Approved receipts pushed back to SAP for inventory posting
- `synced_to_sap` flag tracks sync status

### 2. ICG HQ (Inventory Control Group)

**Integration:**
- Approved receipts posted to ICG system
- `posted_to_icg` flag tracks posting status
- Inventory updates for store stock levels

### 3. Azure AD (Microsoft Authentication)

**Configuration:**
```typescript
{
  clientId: VITE_MSAL_CLIENT_ID,
  authority: VITE_MSAL_AUTHORITY,  // Azure AD tenant
  redirectUri: VITE_MSAL_REDIRECT_URI,
  postLogoutRedirectUri: VITE_MSAL_POST_LOGOUT_REDIRECT_URI,
}
```

**Features:**
- Enterprise SSO for all users
- Token-based authentication (Bearer tokens)
- Role-based access control (roles in JWT claims)
- Automatic token refresh
- Secure logout with redirect

## Security

### Authentication

- **Azure AD Integration**: Enterprise SSO
- **MSAL Token Management**: Automatic token refresh
- **Protected Routes**: Server-side auth checks via `beforeLoad`

### Authorization

- **Role-based Access**: Restaurant Manager role
- **Store-level Permissions**: Users can only access their assigned stores

### API Security

- **Bearer Token**: Automatic injection via Axios interceptor
- **HTTPS Only**: All API calls over secure connection
- **CORS**: Configured for specific origins

## Performance Optimizations

### 1. Code Splitting

**Vite Configuration (`vite.config.ts`):**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-router': ['@tanstack/react-router'],
        'vendor-query': ['@tanstack/react-query'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', /* ... */],
        'vendor-form': ['react-hook-form', 'zod', '@hookform/resolvers'],
        'vendor-utils': ['axios', 'date-fns', 'clsx', 'tailwind-merge'],
      },
    },
  },
}
```

**Benefits:**
- Route-based code splitting via TanStack Router
- Vendor library chunking for better caching
- Reduced initial bundle size
- Parallel chunk loading

### 2. Caching Strategy

**React Query Configuration:**
```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      gcTime: 1000 * 60 * 10,    // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

**Features:**
- Automatic background refetching
- Stale-while-revalidate pattern
- Query invalidation on mutations
- Debounced search queries (500ms)

### 3. Asset Optimization

- Centralized image imports (`src/assets/images/index.ts`)
- Vite asset optimization and hashing
- Static asset caching via browser cache headers
- `.htaccess` rules for SPA routing

## Error Handling

### 1. Authentication Errors

**Axios Interceptor:**
```typescript
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Attempt silent token refresh
      const account = msalInstance.getActiveAccount()
      if (account) {
        const token = await msalInstance.acquireTokenSilent({...})
        // Retry request with new token
      }
    }
    return Promise.reject(error)
  }
)
```

**Features:**
- Automatic token refresh on 401
- Redirect to landing page on auth failure
- User-friendly error messages via toast

### 2. API Errors

**React Query Error Handling:**
```typescript
useMutation({
  onError: (error) => {
    const message = extractErrorMessage(error)
    toast.error(message)
  }
})
```

**Features:**
- Centralized error extraction utility
- Toast notifications (Sonner) for user feedback
- Retry logic for transient failures
- Error state UI components

### 3. Validation Errors

- **Client-side**: React Hook Form + Zod schema validation
- **Server-side**: API error responses displayed inline
- **Real-time**: Input validation on blur/change

## Development Workflow

### 1. Environment Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure Azure AD credentials in .env.local
VITE_MSAL_CLIENT_ID=your-client-id
VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/{tenant-id}
VITE_MSAL_REDIRECT_URI=http://localhost:5173
VITE_MSAL_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_MSAL_SCOPE=api://your-api-scope/.default
VITE_API_BASE_URL=https://your-api-url.com

# Start development server
npm run dev
```

### 2. Build Commands

```bash
# Development server (port 5173)
npm run dev

# Type checking
npm run type-check

# Production build
npm run build

# Preview production build
npm run preview
```

### 3. Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configured
- **Formatting**: Prettier (if configured)
- **Conventions**: Component-driven development, functional components with hooks

## Deployment

### Build Process

```bash
npm run build
# Output: dist/ folder
```

### Subfolder Deployment Configuration

**Vite Config (`vite.config.ts`):**
```typescript
export default defineConfig({
  base: "/grn-transfer/",  // Subfolder path
  // ...
})
```

**Router Config (`main.tsx`):**
```typescript
const router = createRouter({
  routeTree,
  basepath: "/grn-transfer",
  // ...
})
```

**Apache Config (`public/.htaccess`):**
```apache
RewriteEngine On
RewriteBase /grn-transfer/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L,QSA]
```

### Environment Variables

**Required:**
- `VITE_MSAL_CLIENT_ID`: Azure AD application ID
- `VITE_MSAL_AUTHORITY`: Azure AD authority URL (e.g., `https://login.microsoftonline.com/{tenant-id}`)
- `VITE_MSAL_REDIRECT_URI`: OAuth redirect URI (production URL)
- `VITE_MSAL_POST_LOGOUT_REDIRECT_URI`: Post-logout redirect URI
- `VITE_MSAL_SCOPE`: API scope for token requests (e.g., `api://your-api/.default`)
- `VITE_API_BASE_URL`: Backend API base URL

### Hosting Requirements

- **Server**: Apache or Nginx with URL rewrite support
- **HTTPS**: Required for Azure AD authentication
- **Deployment Path**: `/grn-transfer/` subfolder
- **Build Artifacts**: Upload entire `dist/` folder contents
- **`.htaccess`**: Must be included in deployment (located in `public/` folder)

