const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findAndReplace(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            content = content.replace(/\bbg-black\b/g, 'bg-primary-600');
            content = content.replace(/\btext-black\b/g, 'text-primary-950');
            content = content.replace(/\bborder-black\b/g, 'border-primary-600');
            content = content.replace(/\bring-black\b/g, 'ring-primary-600');
            content = content.replace(/\bshadow-black\//g, 'shadow-primary-900/');
            content = content.replace(/\btext-emerald-500\b/g, 'text-primary-500');
            content = content.replace(/\btext-emerald-600\b/g, 'text-primary-600');
            content = content.replace(/\btext-emerald-700\b/g, 'text-primary-700');
            content = content.replace(/\bbg-emerald-50\b/g, 'bg-primary-50');
            content = content.replace(/\bbg-emerald-100\b/g, 'bg-primary-100');
            content = content.replace(/\bbg-emerald-500\b/g, 'bg-primary-500');
            content = content.replace(/\bbg-emerald-600\b/g, 'bg-primary-600');
            content = content.replace(/\bborder-emerald-200\b/g, 'border-primary-200');
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

findAndReplace(directoryPath);
console.log('Site-wide primary color replacement completed.');
