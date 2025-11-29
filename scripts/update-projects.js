const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, '..', 'content', 'projects');

// Read all MDX files in the projects directory
fs.readdir(projectsDir, (err, files) => {
  if (err) {
    console.error('Error reading projects directory:', err);
    return;
  }

  const mdxFiles = files.filter(file => file.endsWith('.mdx'));
  
  mdxFiles.forEach(file => {
    const filePath = path.join(projectsDir, file);
    
    // Read the file content
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }
      
      // Split the content into frontmatter and the rest
      const parts = data.split('---\n');
      if (parts.length >= 3) {
        // Keep only the frontmatter and add 'Work in progress!'
        const newContent = `${parts[0]}---\n${parts[1]}---\n\nWork in progress!`;
        
        // Write the updated content back to the file
        fs.writeFile(filePath, newContent, 'utf8', err => {
          if (err) {
            console.error(`Error writing to file ${file}:`, err);
          } else {
            console.log(`Updated ${file}`);
          }
        });
      } else {
        console.log(`Skipping ${file} - invalid format`);
      }
    });
  });
});
