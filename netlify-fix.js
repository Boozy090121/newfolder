const fs = require('fs');
const path = require('path');

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create index.html if it doesn't exist
const indexPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('Creating index.html...');
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0055a4" />
    <meta
      name="description"
      content="Novo Nordisk Manufacturing Analytics Dashboard"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
    />
    <title>Novo Nordisk Dashboard</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
  fs.writeFileSync(indexPath, indexHtml);
}

// Create manifest.json if it doesn't exist
const manifestPath = path.join(publicDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.log('Creating manifest.json...');
  const manifestJson = `{
  "short_name": "Novo Dashboard",
  "name": "Novo Nordisk Manufacturing Analytics Dashboard",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#0055a4",
  "background_color": "#ffffff"
}`;
  fs.writeFileSync(manifestPath, manifestJson);
}

// Create _redirects file if it doesn't exist
const redirectsPath = path.join(publicDir, '_redirects');
if (!fs.existsSync(redirectsPath)) {
  console.log('Creating _redirects...');
  fs.writeFileSync(redirectsPath, '/* /index.html 200');
}

// Create favicon.ico if it doesn't exist
const faviconPath = path.join(publicDir, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  console.log('Creating empty favicon.ico...');
  fs.writeFileSync(faviconPath, '');
}

// Copy dashboard_data.json to public if it exists in root but not in public
const dashboardDataSrc = path.join(__dirname, 'dashboard_data.json');
const dashboardDataDest = path.join(publicDir, 'dashboard_data.json');
if (fs.existsSync(dashboardDataSrc) && !fs.existsSync(dashboardDataDest)) {
  console.log('Copying dashboard_data.json to public directory...');
  fs.copyFileSync(dashboardDataSrc, dashboardDataDest);
}

console.log('Files have been created successfully!');
console.log('Your project is now ready for Netlify deployment.'); 