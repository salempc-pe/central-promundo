const fs = require('fs');
const path = require('path');

const write = (rel, content) => {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Created:', rel);
};

fs.mkdirSync('src/components/ui', { recursive: true });
