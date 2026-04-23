const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace brutalist drop shadows
  content = content.replace(/shadow-\[[^\]]+\]/g, (match) => {
    if (match.includes('b4,1,1') || match.includes('#b40101')) return 'shadow-lg';
    if (match.includes('8px_8px') || match.includes('12px_12px')) return 'shadow-lg';
    if (match.includes('4px_4px') || match.includes('2px_2px')) return 'shadow-md';
    return 'shadow-sm'; // Default replacement
  });
  
  // Replace brutalist borders
  content = content.replace(/border-4 border-black/g, 'border border-gray-200');
  content = content.replace(/border-2 border-black/g, 'border border-gray-200');
  content = content.replace(/border-2 border-\[\#111827\]/g, 'border border-gray-200');
  content = content.replace(/border border-black/g, 'border border-gray-200');
  content = content.replace(/border-y-4 border-black/g, 'border-y border-gray-200');
  content = content.replace(/border-b-2 border-black/g, 'border-b border-gray-200');
  content = content.replace(/border-l-2 border-black/g, 'border-l border-gray-200');
  
  // Enforce soft shapes everywhere
  content = content.replace(/rounded-none/g, 'rounded-3xl');
  
  // Fix button roundings (sometimes buttons were given rounded-3xl instead of rounded-full)
  // Or just leave rounded-3xl as it is quite curvy.

  fs.writeFileSync(filePath, content);
}

const files = [
  'frontend/src/pages/Properties.tsx',
  'frontend/src/pages/BecomeAgent.tsx',
  'frontend/src/pages/PropertyDetails.tsx',
  'frontend/src/pages/AgentSearch.tsx',
  'frontend/src/pages/AgentProfile.tsx',
  'frontend/src/pages/Home.tsx'
];

files.forEach(file => {
    if(fs.existsSync(file)) {
        processFile(file);
    }
});
