const fs = require('fs');

const path = '../uzwork-backend/src/controllers/uploadController.js';
let content = fs.readFileSync(path, 'utf8');

// Even more robust logic
const robustLogic = `
    const baseUrl = getBaseUrl(req);
    const ext = path.extname(req.file.filename).toLowerCase();
    
    // Determining subDir more robustly
    let subDir = "voice";
    if (ALLOWED_DOC_EXT.has(ext) || req.file.filename.startsWith("doc-")) {
      subDir = "documents";
    } else if (ALLOWED_IMG_EXT.has(ext) || req.file.filename.startsWith("img-")) {
      subDir = "images";
    }
    
    const fileUrl = \`\${baseUrl}/uploads/\${subDir}/\${req.file.filename}\`;
`;

// Find the whole try block area in uploadGeneralFile
const searchPattern = /const uploadGeneralFile = async \(req, res\) => \{[\s\S]*?const baseUrl = getBaseUrl\(req\);[\s\S]*?const fileUrl = [\s\S]*?;/;

if (searchPattern.test(content)) {
  const newContent = content.replace(searchPattern, `const uploadGeneralFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Fayl yuklanmadi." });
    }
${robustLogic}`);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log("Backend uploadController.js updated with ROBUST logic.");
} else {
  console.log("Failed to find uploadGeneralFile pattern.");
}
