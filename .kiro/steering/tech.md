# Technology Stack

## Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with mysql2 driver (promise-based)
- **Authentication**: JWT tokens with bcryptjs for password hashing
- **File Uploads**: Multer middleware
- **Environment**: dotenv for configuration management

## Frontend
- **Framework**: React (separate client directory)
- **Build System**: Create React App (npm run build)

## Development Tools
- **Process Manager**: nodemon for development
- **CORS**: Enabled for cross-origin requests
- **Static Files**: Express static middleware for uploads

## Common Commands

### Development
```bash
npm run dev          # Start server with nodemon
npm run client       # Start React development server
npm run server       # Alternative server start command
```

### Production
```bash
npm start           # Start production server
npm run build       # Build React client for production
```

## Database Configuration
- Connection pooling enabled (max 10 connections)
- Environment-based configuration via .env file
- Automatic connection testing on startup

## File Structure
- Static uploads served from `/uploads` endpoint
- React build files served in production mode
- Health check endpoint at `/api/health`