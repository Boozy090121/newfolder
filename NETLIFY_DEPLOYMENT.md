# Netlify Deployment Instructions

Follow these steps to deploy your Novo Dashboard to Netlify successfully.

## Prerequisites

This repository has been configured with all necessary files for Netlify deployment:

- `netlify.toml` - Contains build settings and redirects
- `_redirects` in public folder - Ensures React routing works
- Updated package.json with compatible dependencies
- Properly configured tsconfig.json

## Deployment Steps

### Option 1: Direct Upload (Simplest)

1. Download the repository as a ZIP file
2. Log in to your Netlify account: [https://app.netlify.com/](https://app.netlify.com/)
3. Click **Add new site** > **Deploy manually**
4. Drag and drop the ZIP file to the designated area
5. Wait for Netlify to deploy your site (may take a few minutes)

### Option 2: Connect to GitHub (Recommended for ongoing updates)

1. Push this repository to your GitHub account
2. Log in to your Netlify account
3. Click **Add new site** > **Import an existing project**
4. Select GitHub as your Git provider
5. Authorize Netlify to access your GitHub repositories
6. Select the repository containing this dashboard
7. Configure build settings (should be auto-detected):
   - Build command: `npm run build`
   - Publish directory: `build`
8. Click **Deploy site**

## Troubleshooting

If you encounter build failures:

1. Check the Netlify build logs for specific errors
2. Common issues and solutions:
   - **Dependency version errors**: Check for outdated or incompatible packages in package.json
   - **Node.js version**: This project is configured to use Node.js 16
   - **Build timeout**: If the build process times out, contact Netlify support

## Post-Deployment Steps

After successful deployment:

1. Set up your custom domain (if needed)
2. Configure HTTPS (Netlify handles this automatically)
3. Test the application thoroughly to ensure everything works correctly
4. Check that dashboard_data.json is loading properly

## Environment Variables

No environment variables are required for basic functionality, but you can add them in Netlify:

1. Go to Site settings > Build & deploy > Environment
2. Add any required variables for your specific configuration 