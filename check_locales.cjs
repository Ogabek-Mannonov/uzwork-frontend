const fs = require('fs');

function checkFile(path) {
  console.log(`Checking ${path}...`);
  try {
    const content = fs.readFileSync(path, 'utf-8');
    JSON.parse(content);
    console.log(`✅ ${path} is perfectly valid JSON!`);
  } catch (err) {
    console.error(`❌ ${path} has a syntax error!`);
    console.error(err.message);
    
    const match = err.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1], 10);
      const content = fs.readFileSync(path, 'utf-8');
      
      const start = Math.max(0, pos - 100);
      const end = Math.min(content.length, pos + 100);
      
      console.log('\n--- Content around the error position ---');
      console.log(content.substring(start, pos) + ' >>> ERROR HERE >>> ' + content.substring(pos, end));
      console.log('-----------------------------------------\n');
    }
  }
}

checkFile('src/locales/uz/translation.json');
checkFile('src/locales/ru/translation.json');
