const fs = require('fs');

function makeButtonsPill(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to find className="..." specifically inside <Button> or <button> tags
  // Since we just swapped rounded-3xl from rounded-none everywhere, we mainly check if it's a button.
  // Actually, the simpler way is to just replace 'rounded-3xl' with 'rounded-full' 
  // on any line that contains "h-14", "h-16", "h-10", "h-12", "px-", etc that look like buttons
  // But let's be more precise
  
  content = content.replace(/(<(?:Button|button)[^>]*className=["'][^"']*)rounded-3xl([^"']*["'])/g, "$1rounded-full$2");
  
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
        makeButtonsPill(file);
    }
});
