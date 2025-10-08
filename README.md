# EV Charging Station Management System - Frontend

A modern, responsive web application for managing EV charging stations, built with React, TypeScript, and Tailwind CSS.

## Features

### Authentication
- Secure login system with token-based authentication
- Role-based access control (Backoffice & Station Operator)
- Protected routes with automatic redirection

### Dashboard
- Overview statistics (Total Bookings, Active Stations, EV Owners, Revenue)
- Recent bookings display
- Station utilization metrics with visual progress bars

### Charging Stations Management
- List all charging stations with search and filter
- View station details (location, type, slots, power capacity)
- Create new charging stations
- Edit existing station information
- Activate/Deactivate stations
- Support for AC, DC, and Both charging types
- Operating hours configuration
- Amenities management

### System Users Management
- Manage Backoffice and Station Operator accounts
- User creation, editing, and deletion
- Search and filter users
- Role and status management

### User Interface
- Dark theme with green accent colors
- Responsive design for all screen sizes
- Modern, clean interface following provided designs
- Loading states and error handling
- Smooth transitions and hover effects

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (ProtectedRoute)
│   ├── layout/          # Layout components (Sidebar, MainLayout)
│   ├── station/         # Station-specific components
│   ├── user/            # User-specific components
│   └── dashboard/       # Dashboard components
├── context/             # React Context (AuthContext)
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── StationsPage.tsx
│   ├── StationFormPage.tsx
│   ├── UsersPage.tsx
│   ├── EVOwnersPage.tsx
│   └── BookingsPage.tsx
├── services/            # API service layer
│   ├── api.ts           # Axios configuration
│   ├── authService.ts   # Authentication API
│   ├── stationService.ts # Station API
│   ├── userService.ts   # User API
│   └── dashboardService.ts # Dashboard API
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── App.tsx              # Main application component
```

## API Integration

The application is configured to work with a REST API backend. All API endpoints are defined in the service layer:

### Authentication
- `POST /api/v1/auth/login` - User login

### Charging Stations
- `GET /api/v1/ChargingStation` - List all stations
- `GET /api/v1/ChargingStation/{id}` - Get station details
- `POST /api/v1/ChargingStation` - Create new station
- `PUT /api/v1/ChargingStation/{id}` - Update station
- `PATCH /api/v1/ChargingStation/{id}/slots` - Update slots
- `PATCH /api/v1/ChargingStation/{id}/deactivate` - Deactivate station
- `PATCH /api/v1/ChargingStation/{id}/activate` - Activate station

### Users
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### Dashboard
- `GET /api/v1/dashboard/stats` - Get statistics
- `GET /api/v1/dashboard/recent-bookings` - Get recent bookings
- `GET /api/v1/dashboard/station-utilization` - Get utilization data

## Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Demo Credentials

### Backoffice User
- Username: `backoffice`
- Password: `password123`

### Station Operator
- Username: `operator`
- Password: `password123`

## Key Features Implementation

### Thin Client Architecture
- All business logic resides on the backend
- Frontend only handles UI/UX and API communication
- No client-side data processing or validation beyond basic form checks
- Loading states during API calls
- Error messages displayed from backend responses

### State Management
- React Context for authentication
- Local component state for UI interactions
- No complex state management library needed

### Error Handling
- Comprehensive error handling for all API calls
- User-friendly error messages
- Loading spinners during async operations
- Form validation feedback

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interface elements
- Accessible navigation

## Design Consistency

The application strictly follows the provided UI designs:
- Black background with dark gray cards
- Green accent color for primary actions
- Consistent spacing and typography
- Icon usage from Lucide React
- Table layouts for data display
- Status badges with appropriate colors
- Form layouts with proper field grouping

## Future Enhancements

- EV Owners management (placeholder implemented)
- Bookings management (placeholder implemented)
- Real-time updates via WebSocket/SignalR
- Advanced filtering and sorting
- Pagination for large datasets
- Export functionality
- Map integration for station locations
- QR code generation for bookings
- Station deactivation modal with validation

## Contributing

This is a university project for SE4040 - Enterprise Application Development.

## License

This project is developed as part of an academic assignment at Sri Lanka Institute of Information Technology.
