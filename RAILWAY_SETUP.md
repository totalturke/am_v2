# Railway Setup Instructions

Follow these steps to set up your Railway deployment correctly with PostgreSQL:

## 1. Database Service Setup
First, make sure you have a PostgreSQL database service in your Railway project:
- In your Railway project, click "New Service" and select "Database" then "PostgreSQL"
- Wait for the database to be created

## 2. Link Database to your Application
- Go to your application service
- Click the "Variables" tab
- Click "Add variable from service"
- Select your PostgreSQL service
- Choose the DATABASE_URL variable
- This will automatically link your database connection string to your application

## 3. Additional Environment Variables
If your application needs any other environment variables, add them in the "Variables" tab as well.

## 4. Redeploy your Application
- Go to the "Deployments" tab
- Click "Deploy now" to redeploy with the new configuration

## Verifying the Connection
You can check your application logs to verify if it's connecting to the database:
- If you see "Database setup complete. Using PostgreSQL database" in the logs, you're connected
- If you see "No DATABASE_URL provided, using in-memory storage", the DATABASE_URL is not properly set

## Troubleshooting
If your application is still not connecting to the database:
1. Verify the DATABASE_URL is properly set in the Variables tab
2. Check that the PostgreSQL service is running
3. Ensure your application is redeployed after making changes to variables
4. Check the build and deployment logs for any errors
