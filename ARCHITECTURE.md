# System Architecture

## Overview

The Goods Receipt Note (GRN) System is a web-based application built for Food Concepts plc to manage inventory receipts across two primary workflows: **Direct Supply** and **Stock Movement**. The system integrates with Microsoft Azure Active Directory for authentication and SAP Business ByDesign for ERP operations.

## Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router (file-based routing)
- **State Management**:
  - TanStack Query (React Query) for server state
  - React hooks for local state
- **Styling**:
  - Tailwind CSS
  - shadcn/ui component library
- **Icons**: Lucide React
- **Authentication**: MSAL (Microsoft Authentication Library) for Azure AD

### Backend Integration

- **API Client**: Axios with MSAL token interceptors
- **Authentication**: Azure AD B2C / Enterprise
- **ERP System**: SAP Business ByDesign (via middleware)

## Project Structure

```
src/
├── assets/
│   └── images/           # Static images (logos, backgrounds)
├── components/
│   └── ui/               # shadcn/ui components
│       └── sidebar.tsx
├── hooks/
│   └── use-auth.ts       # Authentication hook
├── layout/
│   ├── app-sidebar.tsx   # Application sidebar navigation
│   └── header.tsx        # Page header component
├── lib/
│   ├── axios.ts          # Axios instance with MSAL interceptor
│   ├── msal.ts           # MSAL configuration and initialization
│   └── queryClient.ts    # TanStack Query client configuration
├── routes/
│   ├── __root.tsx        # Root layout with SEO meta
│   ├── index.tsx         # Landing page
│   ├── login/
│   │   └── index.tsx     # Login page
│   └── _protected/       # Protected routes layout
│       ├── route.tsx     # Auth guard and layout
│       ├── direct-supply/
│       │   ├── create-grn/
│       │   ├── store-history/
│       │   └── egrn-report/
│       └── stock-movement/
│           ├── search-egtn/
│           ├── create-egrn/
│           │   └── $egtnNumber.tsx
│           └── store-history/
├── types/
│   └── index.d.ts        # TypeScript type definitions
├── utils/
│   └── api/
│       ├── auth.ts       # Authentication mutations
│       └── egrn.ts       # e-GRN/e-GTN API hooks
└── main.tsx              # Application entry point
```

## Architecture Patterns

### 1. Authentication Flow

```
User Login → Azure AD (MSAL) → Access Token → Axios Interceptor → API Calls
```

**Components:**

- `getMsalInstance()`: Singleton function returning global MSAL PublicClientApplication
- `useAuth`: Hook providing `isAuthenticated`, `user`, `getAccessToken`
- `useLoginMutation`: Handles login with loading/error states
- `useLogoutMutation`: Handles logout with loading/error states
- Axios Interceptor: Automatically injects access token into API requests with enhanced error handling

### 2. Route Protection

**File-based routing with layout routes:**

- `_protected/route.tsx` uses `beforeLoad` to check authentication
- Redirects unauthenticated users to `/login` with return URL
- All child routes under `_protected/` are automatically protected

### 3. Data Fetching Pattern

**React Query hooks for all API operations:**

```typescript
// Query (GET)
export const useSearchVendorQuery = ({ search }: { search: string }) => {
  return useQuery({
    queryKey: ["egrn", "vendors", "search", search],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/egrn/v1/vendors/search", {
        params: { search },
      })
      return data
    },
    enabled: !!search,
  })
}

// Mutation (POST/PUT/DELETE)
export const useCreateEGRNMutation = () => {
  return useMutation({
    mutationFn: async payload => {
      const { data } = await axiosInstance.post("/egrn/v1/grns", payload)
      return data
    },
  })
}
```

### 4. Component Architecture

**Separation of concerns:**

- **Pages**: Route components in `src/routes/`
- **Layouts**: Shared layouts in `src/layout/`
- **UI Components**: Reusable components in `src/components/ui/`
- **Business Logic**: Custom hooks in `src/hooks/` and `src/utils/api/`

## Core Features

### Module 1: Direct Supply

**Purpose**: Manage goods receipt from direct suppliers (vendors)

**Workflows:**

1. **Create GRN**: Create goods receipt notes for direct supply orders
2. **Store History**: View historical GRN records
3. **e-GRN Report**: Generate and view e-GRN reports

### Module 2: Stock Movement

**Purpose**: Manage internal stock transfers using e-GTN (electronic Goods Transfer Note)

**Workflows:**

#### 2.1 Search e-GTN

- Input e-GTN number
- Fetch e-GTN details from SAP ByD
- Display e-GTN header and line items
- Navigate to Create e-GRN

#### 2.2 Create e-GRN

- Load e-GTN details via route parameter
- Display side-by-side comparison (Ordered vs Received)
- Input received quantities:
  - **Standard Items**: Quantity in UoM (pieces, kg, liters)
  - **Chicken Items**: Weight (kg), birds/bag, number of bags
- Chicken conversion logic:
  - 1.2-1.4 kg → 9 pieces (avg 1.3 kg)
  - 1.5-1.9 kg → 12 pieces (avg 1.7 kg)
- Calculate outstanding quantities
- Add comments for partial receipts
- Preview e-GRN
- Generate e-GRN
- Download PDF

#### 2.3 Store History

- View historical e-GRN records
- Filter by date, status, store

## Data Flow

### e-GTN to e-GRN Flow

```
1. User searches e-GTN number
   ↓
2. System fetches e-GTN from SAP ByD
   ↓
3. User navigates to Create e-GRN page
   ↓
4. User inputs received quantities/weights
   ↓
5. System calculates:
   - Line totals (Qty Received × Unit Price)
   - Outstanding quantities (Ordered - Received)
   - Chicken pieces (for chicken items)
   ↓
6. User previews e-GRN
   ↓
7. User generates e-GRN
   ↓
8. System:
   - Creates e-GRN record
   - Pushes inventory to ICG HQ (pieces for chicken)
   - Posts accounting entries to SAP ByD via middleware
   - Generates PDF
```

## Integration Points

### 1. SAP Business ByDesign

- **e-GTN Retrieval**: Fetch transfer order details
- **Accounting Entries**: Post inventory transactions
- **Sales Order Updates**: Update SO fulfillment status

### 2. ICG HQ (Inventory Central Gateway)

- **Inventory Push**: Send received inventory data
- **Unit Conversion**: Chicken weight (kg) → pieces

### 3. Middleware

- **Data Transformation**: Convert between GRN system and SAP formats
- **Accounting Logic**: Generate GL entries based on item type

## Accounting Entries

### Stock Items (Packaging & Consumables)

| Item Type   | Debit                                  | Credit          | GL Code         |
| ----------- | -------------------------------------- | --------------- | --------------- |
| Packaging   | Stock Raw Material in Transit (Manual) | Trade Creditors | 161558 / 211001 |
| Consumables | Stock Raw Material in Transit (Manual) | Trade Creditors | 161558 / 211001 |

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

- Route-based code splitting via TanStack Router
- Lazy loading of heavy components

### 2. Caching Strategy

- React Query automatic caching
- Stale-while-revalidate pattern
- Query invalidation on mutations

### 3. Asset Optimization

- Image optimization via Vite
- Centralized image imports
- Static asset caching

## Error Handling

### 1. Authentication Errors

- Automatic token refresh on 401
- Redirect to login on auth failure
- User-friendly error messages

### 2. API Errors

- React Query error states
- Toast notifications for user feedback
- Retry logic for transient failures

### 3. Validation Errors

- Client-side form validation
- Server-side validation feedback
- Inline error messages

## Development Workflow

### 1. Environment Setup

```bash
npm install
cp .env.example .env
# Configure Azure AD credentials
npm run dev
```

### 2. Code Standards

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-driven development

### 3. Testing Strategy

- Unit tests for utilities
- Integration tests for API hooks
- E2E tests for critical workflows

## Deployment

### Build Process

```bash
npm run build
```

### Environment Variables

- `VITE_MSAL_CLIENT_ID`: Azure AD application ID
- `VITE_MSAL_AUTHORITY`: Azure AD authority URL (e.g., `https://login.microsoftonline.com/{tenant-id}`)
- `VITE_MSAL_REDIRECT_URI`: OAuth redirect URI
- `VITE_MSAL_POST_LOGOUT_REDIRECT_URI`: Post-logout redirect URI
- `VITE_MSAL_SCOPE`: API scope for token requests
- `VITE_API_BASE_URL`: Backend API base URL

### Hosting

- Static site deployment (Netlify, Vercel, Azure Static Web Apps)
- CDN for asset delivery
- Environment-specific configurations

## Future Enhancements

1. **Offline Support**: PWA capabilities for offline GRN creation
2. **Mobile App**: React Native version for mobile devices
3. **Real-time Updates**: WebSocket integration for live inventory updates
4. **Advanced Reporting**: BI dashboard with charts and analytics
5. **Barcode Scanning**: Mobile barcode scanning for item verification
6. **Multi-language Support**: i18n for multiple languages
7. **Audit Trail**: Comprehensive logging and audit history
