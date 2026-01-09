# GRN System - Goods Receipt Note Management

> A modern web application for managing inventory receipts across Direct Supply and Stock Movement workflows for Food Concepts plc.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff)](https://vitejs.dev/)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-Latest-ff4154)](https://tanstack.com/router)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-Latest-ff4154)](https://tanstack.com/query)

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

The GRN System is a comprehensive inventory management solution that streamlines the goods receipt process for Food Concepts plc restaurants. It supports two primary workflows:

1. **Direct Supply**: Manage goods receipt from external vendors
2. **Stock Movement**: Handle internal stock transfers using e-GTN (electronic Goods Transfer Note)

The system integrates with:

- **Azure Active Directory** for enterprise authentication
- **SAP Business ByDesign** for ERP operations
- **ICG HQ** for centralized inventory management

## ✨ Features

### 🔐 Authentication & Security

- Azure AD enterprise SSO integration
- Automatic token refresh and management
- Protected routes with authentication guards
- Role-based access control

### 📦 Direct Supply Module

- Create GRN for vendor deliveries
- Store history and reporting
- e-GRN generation and PDF export
- Invoice and delivery status tracking

### 🔄 Stock Movement Module

- **Search e-GTN**: Fetch transfer order details from SAP
- **Create e-GRN**: Record received inventory with:
  - Side-by-side comparison (Ordered vs Received)
  - Standard item quantity input
  - Chicken weight-to-pieces conversion
  - Partial receipt comments
  - Real-time outstanding calculation
- **Store History**: View and filter historical records
- **PDF Generation**: Download e-GRN documents

### 🐔 Chicken Conversion System

Automatic conversion from weight (kg) to pieces:

- 1.2-1.4 kg → 9 pieces (avg 1.3 kg)
- 1.5-1.9 kg → 12 pieces (avg 1.7 kg)

### 🎨 Modern UI/UX

- Responsive design with Tailwind CSS
- shadcn/ui component library
- Collapsible sidebar navigation
- Dark mode support
- Mobile-friendly interface

## 🛠 Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - File-based routing
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Lucide React** - Icon library

### Authentication

- **MSAL** - Microsoft Authentication Library
- **Azure AD** - Identity provider

### API & Integration

- **Axios** - HTTP client
- **SAP ByD** - ERP system
- **Middleware** - Backend integration layer

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
   cp .env.example .env
   ```

4. **Update `.env` with your credentials**

   ```env
   VITE_MSAL_CLIENT_ID=your-azure-client-id
   VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
   VITE_MSAL_REDIRECT_URI=http://localhost:5173
   VITE_MSAL_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
   VITE_MSAL_SCOPE=api://your-api-scope/.default
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
├── assets/              # Static assets (images, fonts)
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
│   └── use-auth.ts     # Authentication hook
├── layout/             # Layout components
│   ├── app-sidebar.tsx # Navigation sidebar
│   └── header.tsx      # Page header
├── lib/                # Core libraries and utilities
│   ├── axios.ts        # Axios instance with interceptors
│   ├── msal.ts         # MSAL configuration
│   └── queryClient.ts  # React Query client
├── routes/             # File-based routes
│   ├── __root.tsx      # Root layout
│   ├── index.tsx       # Landing page
│   ├── login/          # Login page
│   └── _protected/     # Protected routes
│       ├── direct-supply/
│       └── stock-movement/
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   └── api/           # API hooks and mutations
└── main.tsx           # Application entry point
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
User → Login Page → Azure AD → Access Token → Protected Routes
```

### Usage in Components

```typescript
import { useAuth } from "@/hooks/use-auth"
import { useLoginMutation, useLogoutMutation } from "@/utils/api/auth"

function MyComponent() {
  const { isAuthenticated, user } = useAuth()
  const { mutate: login } = useLoginMutation()
  const { mutate: logout } = useLogoutMutation()

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

```typescript
// src/routes/_protected/my-page/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/my-page/')({
  component: MyPage,
})

function MyPage() {
  return <div>My Page Content</div>
}
```

### Adding API Hooks

```typescript
// src/utils/api/my-api.ts
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

export const useMyDataQuery = () => {
  return useQuery({
    queryKey: ["my-data"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/my-data")
      return data
    },
  })
}

export const useCreateMyDataMutation = () => {
  return useMutation({
    mutationFn: async payload => {
      const { data } = await axiosInstance.post("/api/my-data", payload)
      return data
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

### Deployment

The application can be deployed to:

- **Netlify**
- **Vercel**
- **Azure Static Web Apps**
- **AWS S3 + CloudFront**
- Any static hosting service

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design patterns
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes
- **[.env.example](./.env.example)** - Environment variable template

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
