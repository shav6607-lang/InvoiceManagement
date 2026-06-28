# StoneCrush Invoice Management System

Enterprise-grade GST invoice and delivery challan (DC) management application built with React, TypeScript, and Material UI.

## Features

- Secure JWT-based authentication with protected routes
- Invoice listing, creation, viewing, printing, and PDF export
- Delivery challan (DC) management with CRUD operations
- Dashboard with real-time invoice and DC counts
- Responsive layout with light/dark theme support
- Centralized API client with interceptors and error handling

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, Material UI 9 |
| State | Redux Toolkit |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Build | Vite 8, TypeScript 6 |

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── common/       # LoadingSpinner, ErrorBoundary
├── config/           # Environment configuration
├── constants/        # Routes, API endpoints, storage keys
├── layouts/          # AuthLayout, MainLayout
├── pages/            # Feature pages (Dashboard, Invoices, DC, etc.)
├── redux/            # Store, slices, typed hooks
├── routes/           # Application routing
├── services/         # API client and service modules
├── theme/            # MUI theme configuration
├── types/            # Shared TypeScript types
└── utils/            # Logger, storage, auth helpers
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file and configure your API base URL:

```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` to your backend API endpoint.

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## Architecture Notes

- **API Layer**: All HTTP calls go through a centralized Axios client (`src/services/apiClient.ts`) with request/response interceptors for auth tokens and 401 handling.
- **State Management**: Redux Toolkit slices manage domain state (auth, invoices, DCs). Async operations use `createAsyncThunk`.
- **Authentication**: Tokens are stored in localStorage via a storage utility. Protected routes redirect unauthenticated users to login.
- **Error Handling**: Global `ErrorBoundary` catches unhandled React errors. API errors are normalized via `getErrorMessage`.
- **Code Splitting**: Pages are lazy-loaded with React Suspense for optimal bundle size.

## License

Private — internal use only.
