const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure required directories exist
console.log('Ensuring required directories exist...');
const dirs = ['public', 'build', 'src'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created ${dir} directory`);
  }
});

// Run Netlify pre-build script to ensure files exist
console.log('Running pre-build script...');
try {
  require('./netlify-fix');
  console.log('Pre-build script completed successfully');
} catch (error) {
  console.error('Error running pre-build script:', error);
}

// Check package dependencies
console.log('Checking package dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json not found!');
  process.exit(1);
}

const packageJson = require(packageJsonPath);

// List of common Nivo packages
const nivoPackages = [
  '@nivo/core',
  '@nivo/line',
  '@nivo/bar',
  '@nivo/pie',
  '@nivo/heatmap',
  '@nivo/sankey',
  '@nivo/scatterplot',
  '@nivo/radar',
  '@nivo/calendar',
  '@nivo/stream'
];

// Check if Nivo packages are in dependencies
let modified = false;
const currentDeps = packageJson.dependencies || {};

// Ensure all Nivo packages are at the same version
let nivoVersion = '0.85.0'; // Default version
for (const pkg of Object.keys(currentDeps)) {
  if (pkg.startsWith('@nivo/') && currentDeps[pkg]) {
    nivoVersion = currentDeps[pkg].replace(/^\^|~/, '');
    break;
  }
}

// Add missing Nivo packages
for (const pkg of nivoPackages) {
  if (!currentDeps[pkg]) {
    console.log(`Adding missing dependency: ${pkg}@^${nivoVersion}`);
    currentDeps[pkg] = `^${nivoVersion}`;
    modified = true;
  }
}

// Check source files for imports
console.log('Scanning source files for imports...');
const missingDeps = new Set();

function scanDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const importRegex = /import\s+(?:.+\s+from\s+)?['"]([^.][^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          if (!importPath.startsWith('.')) {
            const packageName = importPath.split('/')[0];
            if (!currentDeps[packageName] && !currentDeps[`@types/${packageName}`]) {
              missingDeps.add(packageName);
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning file ${fullPath}:`, error);
      }
    }
  }
}

scanDirectory(path.join(__dirname, 'src'));

// Add any missing dependencies found in imports
for (const dep of missingDeps) {
  if (!dep.startsWith('@') && !currentDeps[dep]) {
    console.log(`Adding missing dependency from imports: ${dep}@latest`);
    currentDeps[dep] = 'latest';
    modified = true;
  }
}

// Save updated package.json if modified
if (modified) {
  packageJson.dependencies = currentDeps;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with missing dependencies.');
  
  // Optionally install dependencies
  console.log('Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
  } catch (error) {
    console.error('Error installing dependencies:', error);
  }
} else {
  console.log('No missing dependencies found.');
}

// Update build script in package.json
if (!packageJson.scripts || !packageJson.scripts.build) {
  if (!packageJson.scripts) packageJson.scripts = {};
  packageJson.scripts.build = 'CI=false SKIP_PREFLIGHT_CHECK=true react-scripts build';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Added build script to package.json.');
}

console.log('Build issue fixing completed.');
console.log('To deploy to Netlify, run: "npm run build" and upload the "build" directory.'); 