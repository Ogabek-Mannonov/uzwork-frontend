const fs = require('fs');

const content = fs.readFileSync('src/locales/ru/translation.json', 'utf-8');
const lines = content.split('\n');

console.log('Lines 1290 to 1360 of ru/translation.json:');
for (let i = 1290; i <= 1360; i++) {
  if (i < lines.length) {
    console.log(`${i}: ${lines[i]}`);
  }
}
