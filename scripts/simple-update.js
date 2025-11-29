const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, '..', 'content', 'projects');
const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.mdx'));

files.forEach(file => {
  const filePath = path.join(projectsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatterEnd = content.indexOf('---', 3) + 3; // Find the second '---'
  const newContent = content.substring(0, frontmatterEnd) + '\n\nWork in progress!';
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Updated ${file}`);
});

console.log('\n✅ All project files have been updated!');
