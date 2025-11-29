const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const projectsDir = path.join(__dirname, '..', 'content', 'projects');

async function updateProjects() {
  try {
    const files = await readdir(projectsDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    for (const file of mdxFiles) {
      const filePath = path.join(projectsDir, file);
      try {
        let content = await readFile(filePath, 'utf8');
        
        // Split content at the second '---' and keep only the frontmatter
        const parts = content.split('---\n');
        if (parts.length >= 3) {
          const newContent = `${parts[0]}---\n${parts[1]}---\n\nWork in progress!`;
          await writeFile(filePath, newContent, 'utf8');
          console.log(`✓ Updated ${file}`);
        } else {
          console.log(`⚠️  Skipping ${file} - invalid format`);
        }
      } catch (err) {
        console.error(`❌ Error processing ${file}:`, err.message);
      }
    }
    
    console.log('\n✅ All project files have been updated!');
  } catch (err) {
    console.error('❌ Error reading projects directory:', err);
  }
}

updateProjects();
