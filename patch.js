const fs = require('fs');
const path = require('path');
const dir = 'd:/busine/extensions/bored/games';
const files = fs.readdirSync(dir);
for (const file of files) {
    if (file.endsWith('.js')) {
        let content = fs.readFileSync(path.join(dir, file), 'utf8');
        
        let changed = false;
        
        // Handle `e.clientX - rect.left`
        if (content.match(/e\.clientX\s*-\s*rect\.left/g) && !content.includes('.width / rect.width')) {
            content = content.replace(/e\.clientX\s*-\s*rect\.left/g, "((e.clientX - rect.left) * (this.canvas.width / rect.width))");
            changed = true;
        }

        // Handle `e.clientY - rect.top`
        if (content.match(/e\.clientY\s*-\s*rect\.top/g) && !content.includes('.height / rect.height')) {
            content = content.replace(/e\.clientY\s*-\s*rect\.top/g, "((e.clientY - rect.top) * (this.canvas.height / rect.height))");
            changed = true;
        }
        
        // Handle `e.clientX - this.canvas.getBoundingClientRect().left`
        if (content.match(/e\.clientX\s*-\s*this\.canvas\.getBoundingClientRect\(\)\.left/g) && !content.includes('.getBoundingClientRect().width')) {
            content = content.replace(/e\.clientX\s*-\s*this\.canvas\.getBoundingClientRect\(\)\.left/g, "((e.clientX - this.canvas.getBoundingClientRect().left) * (this.canvas.width / this.canvas.getBoundingClientRect().width))");
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(path.join(dir, file), content, 'utf8');
            console.log('Patched ' + file);
        }
    }
}
console.log('Done!');
