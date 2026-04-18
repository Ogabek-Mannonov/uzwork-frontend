const fs = require('fs');

const path = 'C:/Users/ismoil/Desktop/uzwork/uzwork-backend/src/controllers/uploadController.js';
let content = fs.readFileSync(path, 'utf8');

// The bug: subDir is either "documents" or "voice", ignoring "images"
// Target code:
// const subDir = ALLOWED_DOC_EXT.has(ext) ? "documents" : "voice";
// const fileUrl = \`${baseUrl}/uploads/${subDir}/${req.file.filename}\`;

const oldLogic = 'const subDir = ALLOWED_DOC_EXT.has(ext) ? "documents" : "voice";';
const newLogic = `const subDir = ALLOWED_DOC_EXT.has(ext) ? "documents" : (ALLOWED_IMG_EXT.has(ext) ? "images" : "voice");`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Backend uploadController.js patched successfully.");
} else {
  console.log("Failed to patch backend uploadController.js - target not found or already patched.");
}
