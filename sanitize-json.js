const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFile = path.join(__dirname, 'public', 'dashboard_data.json');
const outputFile = path.join(__dirname, 'public', 'dashboard_data_safe.json');

console.log('Reading dashboard_data.json...');
// Read the file as a string (don't parse it directly as JSON to avoid errors)
let jsonString = fs.readFileSync(inputFile, 'utf8');

// Replace problematic property names with safe alternatives
console.log('Sanitizing property names...');

// Handle specific problematic properties
jsonString = jsonString.replace(/"wo\/lot#"/g, '"woLotNumber"');
jsonString = jsonString.replace(/"total_cycle_time_\(days\)"/g, '"totalCycleTimeDays"');
jsonString = jsonString.replace(/"pci_l\/a_br_review_date"/g, '"pciLaBrReviewDate"');
jsonString = jsonString.replace(/"nn_l\/a_br_review_date"/g, '"nnLaBrReviewDate"');
jsonString = jsonString.replace(/"date_pci_l\/a_br_review_date"/g, '"datePciLaBrReviewDate"');
jsonString = jsonString.replace(/"date_nn_l\/a_br_review_date"/g, '"dateNnLaBrReviewDate"');
jsonString = jsonString.replace(/"oee's"/g, '"oees"');

// General regex replacement for any other properties with special characters
// This is a safety catch-all for any properties we might have missed
jsonString = jsonString.replace(/"([^"]*[\\\/\(\)#\*\?\[\]\{\}\%\&\$\@\!\+\=\:\;\'\"\,\.\<\>\^]*)"/g, function(match, p1) {
  // Replace special characters with safe alternatives
  let safe = p1.replace(/[^a-zA-Z0-9_]/g, '_');
  return `"${safe}"`;
});

// Write the sanitized JSON to the output file
console.log('Writing sanitized JSON to dashboard_data_safe.json...');
fs.writeFileSync(outputFile, jsonString);

console.log('Done! Now update your DataService.ts to load dashboard_data_safe.json instead.');

// Optional: Copy the sanitized file over the original
// Uncomment the line below if you want to replace the original file
// fs.copyFileSync(outputFile, inputFile); 