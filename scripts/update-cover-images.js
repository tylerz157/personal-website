const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const projectsDir = path.join(__dirname, '..', 'content', 'projects');

async function updateCoverImages() {
  try {
    const files = fs.readdirSync(projectsDir).filter(file => file.endsWith('.mdx'));
    
    for (const file of files) {
      const filePath = path.join(projectsDir, file);
      const projectName = path.basename(file, '.mdx');
      const newCoverImage = `/images/${projectName}Cover.png`;
      
      let content = await readFile(filePath, 'utf8');
      
      // Update the coverImage line
      content = content.replace(
        /coverImage: ".*"/,
        `coverImage: "${newCoverImage}"`
      );
      
      // Update the coverAlt to be more descriptive
      content = content.replace(
        /coverAlt: ".*"/,
        `coverAlt: "${projectName.replace(/-/g, ' ')} cover image"`
      );
      
      await writeFile(filePath, content, 'utf8');
      console.log(`✅ Updated ${file}`);
    }
    
    console.log('\n🎉 All project cover images have been updated!');
  } catch (error) {
    console.error('❌ Error updating cover images:', error);
  }
}

updateCoverImages();
