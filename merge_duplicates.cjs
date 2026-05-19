const fs = require('fs');

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

function mergeTranslationDuplicates(filePath) {
  console.log(`\n========================================`);
  console.log(`Processing file: ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const rootKeys = {};
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Match root-level keys indented by exactly 2 spaces
    const match = line.match(/^  "([^"]+)":\s*(\{)?/);
    
    if (match) {
      const key = match[1];
      const isObject = !!match[2];
      
      if (isObject) {
        let blockLines = [line];
        let j = i + 1;
        let openBraces = 1;
        
        while (j < lines.length) {
          const nextLine = lines[j];
          blockLines.push(nextLine);
          
          let inString = false;
          let escaped = false;
          for (let c = 0; c < nextLine.length; c++) {
            const char = nextLine[c];
            if (escaped) { escaped = false; continue; }
            if (char === '\\') { escaped = true; continue; }
            if (char === '"') { inString = !inString; continue; }
            if (!inString) {
              if (char === '{') openBraces++;
              if (char === '}') openBraces--;
            }
          }
          
          if (openBraces === 0) {
            break;
          }
          j++;
        }
        
        let blockStr = blockLines.join('\n').trim();
        if (blockStr.endsWith(',')) blockStr = blockStr.slice(0, -1);
        
        try {
          const obj = JSON.parse('{' + blockStr + '}');
          const parsedVal = obj[key];
          
          if (!rootKeys[key]) {
            rootKeys[key] = parsedVal;
          } else {
            console.log(`[Object] Duplicate root key found: "${key}". Deep merging...`);
            deepMerge(rootKeys[key], parsedVal);
          }
        } catch (err) {
          console.error(`Error parsing object block for key "${key}":`, err.message);
        }
        
        i = j + 1;
      } else {
        // Flat value key
        let valStr = line.trim();
        if (valStr.endsWith(',')) valStr = valStr.slice(0, -1);
        
        try {
          const obj = JSON.parse('{' + valStr + '}');
          rootKeys[key] = obj[key];
        } catch (err) {
          console.error(`Error parsing simple key "${key}":`, err.message);
        }
        i++;
      }
    } else {
      i++;
    }
  }
  
  // Save the cleaned and merged translations
  try {
    fs.writeFileSync(filePath, JSON.stringify(rootKeys, null, 2), 'utf-8');
    console.log(`✅ Successfully merged and cleaned all duplicate keys in ${filePath}!`);
  } catch (err) {
    console.error(`Error saving cleaned file ${filePath}:`, err.message);
  }
}

mergeTranslationDuplicates('src/locales/en/translation.json');
mergeTranslationDuplicates('src/locales/ru/translation.json');
mergeTranslationDuplicates('src/locales/uz/translation.json');
