# Hotel Management System

## Overview

This is a full-stack hotel management system built with React and Express. The application provides comprehensive functionality for managing hotel operations including room management, bookings, guest information, and WhatsApp command integration. The system features a modern UI built with shadcn/ui components and uses PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Development Server**: TSX for TypeScript execution in development
- **Production Build**: esbuild for server-side bundling

### Database Architecture
- **Database**: PostgreSQL (configured for use with Neon or similar cloud providers)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas integrated with Drizzle for runtime validation

## Key Components

### Core Entities
1. **Users**: Staff authentication and role management (admin, manager, staff)
2. **Rooms**: Room inventory with status tracking, pricing, and amenities
3. **Guests**: Customer information and contact details
4. **Bookings**: Reservation management with check-in/check-out functionality
5. **WhatsApp Commands**: Integration for processing hotel management commands via WhatsApp

### Frontend Components
- **Dashboard**: Central hub with statistics, room status grid, and recent activity
- **Room Management**: Room status overview, blocking/unblocking functionality
- **Booking Management**: Reservation handling, check-in/check-out operations
- **Guest Management**: Customer information tracking
- **WhatsApp Integration**: Command processing and status monitoring
- **Reports**: Analytics and reporting functionality
- **Settings**: System configuration and user management

### API Endpoints
- `/api/dashboard/stats` - Dashboard statistics
- `/api/rooms` - Room management operations
- `/api/bookings` - Booking CRUD operations
- `/api/guests` - Guest information management
- `/api/whatsapp/commands` - WhatsApp command processing

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **Server Processing**: Express routes handle requests and validate input
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Handling**: JSON responses are cached and managed by React Query
5. **UI Updates**: Components reactively update based on server state changes

### Real-time Updates
- Dashboard statistics refresh every 30 seconds
- Room status updates every 30 seconds  
- WhatsApp commands poll every 5-10 seconds for near real-time updates

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React Query, React Hook Form
- **UI Framework**: Radix UI primitives, shadcn/ui components
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Validation**: Zod for schema validation
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Development**: Vite, TypeScript, ESBuild

### Optional Integrations
- **WhatsApp**: Twilio integration for WhatsApp Business API
- **AI Processing**: OpenAI API for natural language command parsing
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Port**: 5000 (configured in .replit)
- **Hot Reload**: Vite HMR for frontend, TSX for backend
- **Database**: PostgreSQL module in Replit environment

### Production Build
- **Build Command**: `npm run build`
- **Build Process**: 
  1. Vite builds frontend assets to `dist/public`
  2. ESBuild bundles server code to `dist/index.js`
- **Start Command**: `npm run start`
- **Deployment Target**: Autoscale deployment on Replit

### Database Management
- **Push Schema**: `npm run db:push` using Drizzle Kit
- **Migrations**: Located in `./migrations` directory
- **Connection**: Environment variable `DATABASE_URL` required

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 27, 2025. Initial setup