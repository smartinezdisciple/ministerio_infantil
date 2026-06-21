import fs from 'fs';
import path from 'path';

const searchDir = 'c:/Users/Admin/Downloads/Infantil/frontend/src/components';

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const formFieldRegex = /<(input|select|textarea)\b([^>]*)/gi;
    let match;

    while ((match = formFieldRegex.exec(content)) !== null) {
      const tagName = match[1];
      const attributes = match[2];
      
      const hasId = /\bid=["']/.test(attributes) || /\bid=\{/.test(attributes);
      const hasName = /\bname=["']/.test(attributes) || /\bname=\{/.test(attributes);
      
      if (!hasId && !hasName) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        console.log(`⚠️ Missing id/name in ${filePath}:${lineNum} -> <${tagName} ${attributes.trim().substring(0, 100)}...`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      analyzeFile(fullPath);
    }
  }
}

traverse(searchDir);
console.log('--- Components Scan completed ---');
