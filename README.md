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
- Database: In-memory storage with PostgreSQL support via Drizzle ORM

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Deployment to Railway

1. Create a new Railway project
2. Connect your GitHub repository
3. Add a PostgreSQL database service (optional)
4. Set environment variables:
   - `PORT`: Set by Railway automatically
   - `DATABASE_URL`: Set by Railway if using PostgreSQL
   - `NODE_ENV`: "production" (set in Procfile)

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (optional, will use in-memory storage if not provided)
- `PORT`: Port for the server to listen on (defaults to 5000)
- `NODE_ENV`: Environment mode (development or production)

## Debugging

The application includes debugging endpoints for development:

- `/api/debug/data`: Shows all data in the storage
- `/api/debug/reset`: Resets and reinitializes the data

## License

MIT
