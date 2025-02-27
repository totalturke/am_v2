# Apartment Management System

A comprehensive application for managing apartment buildings, units, maintenance tasks, and inventory.

## Features

- User management with role-based access control
- Building and apartment unit management
- Maintenance task tracking and assignment
- Material inventory management
- Purchase order system
- Responsive UI for mobile and desktop

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite (with Drizzle ORM)
- **Deployment**: Railway

## Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/apartment-management.git
   cd apartment-management
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up the database
   ```bash
   npm run db:setup
   ```

4. Start development server
   ```bash
   npm run dev
   ```

5. Open your browser to http://localhost:5000

## Deployment to Railway

The application is configured for easy deployment to [Railway](https://railway.app/).

### Prerequisites

1. Create a Railway account
2. Install Railway CLI (optional but recommended)
   ```bash
   npm i -g @railway/cli
   ```

### Deployment Steps

1. Create a new Railway project
   ```bash
   railway init
   ```

2. Link your local repository to the Railway project
   ```bash
   railway link
   ```

3. Push your code to deploy
   ```bash
   railway up
   ```

4. Deploy manually through the Railway dashboard
   - Connect your GitHub repository
   - Railway will automatically detect the Procfile and build scripts
   - The app will be built and deployed

### Environment Variables

The following environment variables can be configured in Railway:

- `NODE_ENV`: Set to `production` for deployment
- `PORT`: Automatically set by Railway
- `RAILWAY_ENVIRONMENT`: Set to `production` (automatically set by Railway)

### Database Persistence

Railway provides a persistent volume mounted at `/data`. The application is configured to automatically use this location for the SQLite database file.

## Default Login Credentials

- Username: `admin`
- Password: `admin123`

## License

MIT
