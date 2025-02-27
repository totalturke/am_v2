# Apartment Master

A comprehensive apartment management system for property managers, maintenance staff, and purchasing agents.

## Features

- Dashboard with key metrics and task status
- Apartment and building management
- Maintenance task tracking
- Material inventory management
- Purchase order system
- User role-based access control

## Tech Stack

- Frontend: React, Tailwind CSS, Shadcn UI
- Backend: Node.js, Express
- Database: SQLite via Drizzle ORM (with in-memory fallback)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Initialize and seed the SQLite database manually
npm run db:setup
```

## Deployment to Railway

1. Create a new Railway project
2. Connect your GitHub repository
3. Set environment variables:
   - `PORT`: Set by Railway automatically
   - `NODE_ENV`: "production" (set in Procfile)

No external database service is required - the application uses SQLite which stores data in a file within the application's file system.

## Database Management

The application uses SQLite for data persistence, which stores all data in a single file at `./data/sqlite.db`:

- `npm run db:init`: Create the database schema
- `npm run db:seed`: Populate the database with sample data 
- `npm run db:setup`: Run both init and seed commands

## Environment Variables

- `PORT`: Port for the server to listen on (defaults to 5000)
- `NODE_ENV`: Environment mode (development or production)
- `USE_MEMORY_STORAGE`: Set to 'true' to use in-memory storage instead of SQLite (for testing)

## Debugging

The application includes debugging endpoints for development:

- `/api/debug/data`: Shows all data in the storage
- `/api/debug/reset`: Resets and reinitializes the data

## Health Check

- `/health`: Returns application health status and diagnostics

## License

MIT
