const fs = require('fs');
const { execSync } = require('child_process');

console.log('Restoring src/locales/ru/translation.json from Git to clean up previous scrambles...');
try {
  execSync('git checkout src/locales/ru/translation.json', { stdio: 'inherit' });
  console.log('✅ Successfully restored original ru/translation.json!');
} catch (err) {
  console.error('⚠️ Warning: Could not run git checkout, proceeding with current file state:', err.message);
}

console.log('\nFixing src/locales/ru/translation.json...');
try {
  const ruPath = 'src/locales/ru/translation.json';
  let ruContent = fs.readFileSync(ruPath, 'utf-8');
  
  const ruTarget = '"deleting":';
  const ruIdx = ruContent.indexOf(ruTarget);
  
  if (ruIdx !== -1) {
    const ruEndOfLineIdx = ruContent.indexOf('\n', ruIdx);
    if (ruEndOfLineIdx !== -1) {
      // CRITICAL: Search for "sidebar": starting AFTER the "deleting" block!
      const ruNextTarget = '"sidebar":';
      const ruNextIdx = ruContent.indexOf(ruNextTarget, ruEndOfLineIdx);
      
      if (ruNextIdx !== -1) {
        const before = ruContent.substring(0, ruEndOfLineIdx + 1);
        const after = ruContent.substring(ruNextIdx);
        
        // Correct Russian translation block in UTF-8
        const middle = `      "makeActive": "Сделать активной",\n      "makeDraft": "Сделать черновиком",\n      "close": "Закрыть"\n    },\n    "status": {\n      "active": "Активный",\n      "open": "Активный",\n      "draft": "Черновик",\n      "closed": "Закрытый",\n      "completed": "Завершено",\n      "in_progress": "В процессе"\n    }\n  },\n  "postJob": {\n    `;
        
        fs.writeFileSync(ruPath, before + middle + after, 'utf-8');
        console.log('✅ ru/translation.json has been successfully fixed and saved in clean UTF-8!');
      } else {
        console.error('❌ Could not find "sidebar" block in ru/translation.json after the deleting block.');
      }
    } else {
      console.error('❌ Could not find end of line for "deleting" block in ru/translation.json');
    }
  } else {
    console.error('❌ Could not find "deleting" block in ru/translation.json');
  }
} catch (err) {
  console.error('Error fixing Russian translation:', err.message);
}
