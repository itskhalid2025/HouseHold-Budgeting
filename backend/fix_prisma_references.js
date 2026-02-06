const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src');

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            checkAndFixFile(filePath);
        }
    });
}

function checkAndFixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Regex matches prisma.user. followed by any method call or property, avoiding fixing it twice if it's already prisma.users.
    // However, simplest safe check is looking for "prisma.user." and replacing with "prisma.users."
    // We strictly match "prisma.user." to avoid matching "prisma.userPoints" or similar if they existed.

    const regex = /prisma\.user\./g;

    if (regex.test(content)) {
        console.log(`Fixing: ${filePath}`);
        const newContent = content.replace(regex, 'prisma.users.');
        fs.writeFileSync(filePath, newContent, 'utf8');
    }
}

console.log('Starting global fix for prisma.users mismatch...');
walkDir(targetDir);
console.log('Done.');
