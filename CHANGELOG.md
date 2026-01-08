# Changelog

All notable changes to the GRN System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Stock Movement module with e-GTN search and e-GRN creation workflow
- Type definitions for e-GTN and e-GRN data structures
- API hooks for vendor search, PO line items, and GRN filtering
- Dynamic routing for e-GRN creation with e-GTN number parameter
- Store history pages for both Direct Supply and Stock Movement modules
- e-GRN report page for Direct Supply module

### Changed

- Updated sidebar navigation with organized menu structure
- Improved sidebar UX with cursor pointer on interactive elements
- Refactored protected route layout to use separate layout components
- Updated login redirect to point to Direct Supply create-grn page

### Fixed

- Fixed Header import casing inconsistency
- Removed unused imports from protected route layout

## [0.2.0] - 2025-01-08

### Added

- Shadcn sidebar component integration
- Collapsible navigation menu with icons
- User information display in sidebar footer
- Logout functionality in sidebar
- Custom sidebar theming with brand colors
- Sidebar header with company logo
- Responsive sidebar with mobile support

### Changed

- Migrated from inline sidebar to dedicated `app-sidebar.tsx` component
- Updated sidebar background color to match primary brand color
- Improved sidebar menu structure with grouped navigation items
- Enhanced sidebar menu button styling with chevron indicators

### Removed

- Removed redundant `ProtectedRoute` component (replaced by TanStack Router `beforeLoad`)
- Removed unused `queryClient.ts` file
- Removed old `Header.tsx` layout file

## [0.1.0] - 2025-01-07

### Added

- Initial project setup with Vite + React + TypeScript
- MSAL authentication integration with Azure AD
- TanStack Router for file-based routing
- TanStack Query for server state management
- Axios instance with MSAL token interceptor
- Protected routes with authentication guards
- Login page with Azure AD authentication
- Landing page with portal selection
- Custom `useAuth` hook for authentication state
- `useLoginMutation` and `useLogoutMutation` for auth actions
- Centralized image asset management
- Tailwind CSS configuration
- shadcn/ui component library setup
- SEO metadata support via TanStack Router
- Environment variable configuration for Azure AD

### Authentication

- MSAL PublicClientApplication initialization
- Automatic token refresh handling
- Silent token acquisition with popup fallback
- Active account management
- Login/logout event callbacks

### Routing

- File-based routing structure
- Protected layout route (`_protected`)
- Authentication redirect with return URL
- Route-level authentication checks via `beforeLoad`

### Styling

- Custom color scheme with oklch color space
- Primary and secondary brand colors
- Sidebar-specific color variables
- Dark mode support
- Custom font integration (Inter)

### API Integration

- Axios instance with base URL configuration
- Request interceptor for automatic token injection
- Response interceptor for error handling
- Environment-based API scope configuration

### Developer Experience

- TypeScript strict mode
- Path aliases (`@/` for `src/`)
- Image type declarations
- ESLint configuration
- Hot module replacement (HMR)

## [0.0.1] - 2025-01-06

### Added

- Initial repository setup
- Basic Vite + React + TypeScript template
- Project structure and folder organization
- Git repository initialization
- README with basic setup instructions

---

## Version History Summary

- **v0.2.0**: Sidebar integration and navigation improvements
- **v0.1.0**: Core authentication and routing infrastructure
- **v0.0.1**: Initial project setup

## Migration Notes

### From v0.1.0 to v0.2.0

- The `ProtectedRoute` component is no longer needed. Use TanStack Router's `beforeLoad` in layout routes instead.
- Sidebar navigation is now centralized in `app-sidebar.tsx`. Update any custom navigation items there.
- Sidebar colors are controlled via CSS variables in `index.css`. Update `--sidebar-*` variables for theming.

### From v0.0.1 to v0.1.0

- Azure AD credentials must be configured in `.env` file
- MSAL authentication is now required for all protected routes
- API calls automatically include authentication tokens

## Breaking Changes

### v0.2.0

- Removed `ProtectedRoute` component - use layout routes with `beforeLoad` instead
- Changed sidebar component structure - custom sidebars must follow new pattern

### v0.1.0

- Initial release - no breaking changes

## Deprecations

### v0.2.0

- `ProtectedRoute` component (removed)
- Direct MSAL hook usage in components (use `useAuth` instead)

## Security Updates

### v0.1.0

- Implemented MSAL token management
- Added automatic token refresh
- Secured API calls with bearer token authentication
- Protected routes with authentication guards

## Known Issues

### Current

- None reported

### Resolved

- ✅ CSS unknown at-rule warnings (v0.1.0)
- ✅ Image import type declarations missing (v0.1.0)
- ✅ Route path trailing slash inconsistency (v0.1.0)
- ✅ Sidebar cursor pointer missing (v0.2.0)

## Roadmap

### v0.3.0 (Planned)

- [ ] Complete e-GTN search functionality
- [ ] Implement e-GRN creation form
- [ ] Add chicken conversion calculator
- [ ] Implement e-GRN preview modal
- [ ] Add PDF generation for e-GRN
- [ ] Implement store history filtering
- [ ] Add e-GRN report generation

### v0.4.0 (Planned)

- [ ] Direct Supply GRN creation workflow
- [ ] Vendor search and selection
- [ ] Purchase order integration
- [ ] Invoice management
- [ ] Delivery status tracking

### v1.0.0 (Future)

- [ ] Production-ready release
- [ ] Complete test coverage
- [ ] Performance optimization
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Mobile responsive design
- [ ] Offline support (PWA)
- [ ] Multi-language support (i18n)

## Contributors

- Development Team - Food Concepts plc

## Support

For issues, questions, or contributions, please contact the development team.
