# IIS Deployment Guide for NestJS Application

## Issues Fixed

### 1. Duplicate DTO Error ✅
- **Problem**: `ChangePasswordDto` was defined in two locations with different schemas
  - `src/mobile-app/app-users/dto/change-password.dto.ts` (oldPassword)
  - `src/users/dto/change-password.dto.ts` (currentPassword)
- **Solution**: Renamed mobile app DTO to `AppChangePasswordDto` to avoid naming conflicts

### 2. Port Permission Error ✅
- **Problem**: Application was hardcoded to listen on port 4000, causing `EACCES: permission denied` in IIS
- **Solution**: Updated `main.ts` to use `process.env.PORT || 4000` so IIS can provide the port dynamically

## Prerequisites for IIS Hosting

1. **Install iisnode**: Download and install from https://github.com/tjanczuk/iisnode/releases
2. **Install Node.js**: Ensure Node.js is installed on the server
3. **Install URL Rewrite Module**: Download from https://www.iis.net/downloads/microsoft/url-rewrite

## Deployment Steps

### Step 1: Build the Application
```bash
npm run build
```

### Step 2: Copy Files to IIS Directory
Copy the following to your IIS website directory (e.g., `C:\inetpub\wwwroot\LabProject`):
- `dist/` folder (compiled application)
- `node_modules/` folder
- `package.json`
- `web.config` (already created)
- Any other necessary files (uploads, configuration files, etc.)

### Step 3: Configure IIS Application

1. Open IIS Manager
2. Create a new website or application
3. Set the physical path to your application directory
4. Configure Application Pool:
   - .NET CLR Version: **No Managed Code**
   - Pipeline Mode: **Integrated**
   - Identity: Use an account with appropriate permissions

### Step 4: Set Environment Variables

In IIS Manager, go to your application → Configuration Editor:
- Section: `system.webServer/iisnode`
- Add environment variables if needed (e.g., database credentials, JWT secrets)

### Step 5: Configure Database Connection

Ensure your `configuration.json` or environment variables contain the correct database connection settings for the production server.

### Step 6: Verify Permissions

Ensure the IIS Application Pool identity has:
- Read & Execute permissions on the application folder
- Write permissions on any folders where the app writes files (e.g., `uploads/`)

## Troubleshooting

### If the site doesn't start:
1. Check iisnode logs at: `C:\inetpub\wwwroot\LabProject\iisnode\`
2. Verify Node.js is installed and in the system PATH
3. Check that all npm dependencies are installed: `npm install --production`

### Common Issues:

1. **Module not found errors**: Run `npm install` in the deployment directory
2. **Database connection errors**: Verify connection strings and firewall rules
3. **Port already in use**: The app will use the port provided by IIS (no need to worry about port 4000)

## Testing

After deployment:
1. Navigate to: `http://yourserver/api` (Swagger documentation)
2. Test mobile app endpoints: `http://yourserver/mobile-app/app-users/login`
3. Check application logs for any errors

## Environment Variables

Make sure to set these in production:
- `NODE_ENV=production`
- `PORT` (automatically set by IIS)
- Database credentials
- JWT secret keys
- Email service credentials

## Notes

- The `web.config` file is configured to use `dist/main.js` as the entry point
- The application will automatically use the port provided by IIS via `process.env.PORT`
- All API routes will be accessible under your IIS website URL

