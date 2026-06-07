const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
}

const getActualFilename = (dir, name) => {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const match = files.find(f => f.toLowerCase() === name.toLowerCase());
  return match || null;
};

const srcDir = path.join(__dirname, 'src');
const jsxFiles = walkSync(srcDir);

let fixedCount = 0;

for (const file of jsxFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Find all CSS imports: import "./something.css" or import "../something.css"
  const importRegex = /import\s+['"]([^'"]+\.css)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Only resolve relative paths
    if (importPath.startsWith('.')) {
      const resolvedPath = path.resolve(path.dirname(file), importPath);
      const targetDir = path.dirname(resolvedPath);
      const targetName = path.basename(resolvedPath);
      
      const actualName = getActualFilename(targetDir, targetName);
      
      if (actualName && actualName !== targetName) {
        // Replace in content
        const fixedImportPath = importPath.replace(targetName, actualName);
        console.log(`Fixing in ${path.relative(srcDir, file)}: ${importPath} -> ${fixedImportPath}`);
        
        // We have to replace exactly the matched string in the file
        // To be safe, we just string replace
        content = content.replace(`import "${importPath}"`, `import "${fixedImportPath}"`);
        content = content.replace(`import '${importPath}'`, `import '${fixedImportPath}'`);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} files!`);
