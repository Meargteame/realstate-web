const fs = require('fs');

function makeInputsCurvy(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Round generic div blocks that lack rounding but have large padding (like cards)
  content = content.replace(/className="(.*bg-white p-8.*)"/g, (match, p1) => {
      if(!p1.includes('rounded')) return `className="${p1} rounded-3xl"`;
      return match;
  });

  // Specifically target inputs to make them pill shaped
  content = content.replace(/<(input|select|textarea)([^>]*)className=["']([^"']*)["']/g, (match, tag, before, classAttr) => {
      if(!classAttr.includes('rounded')) {
          return `<${tag}${before}className="${classAttr} rounded-full"`;
      }
      return match;
  });
  
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
        makeInputsCurvy(file);
    }
});
