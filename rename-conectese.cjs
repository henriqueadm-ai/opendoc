const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['.git', 'node_modules', 'dist', 'build'];

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (IGNORE_DIRS.includes(file)) continue;
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
      callback(filepath, true);
    } else {
      callback(filepath, false);
    }
  }
}

// 1. Text Replacements in files
function replaceTextInFile(filepath) {
  try {
    const ext = path.extname(filepath);
    if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip'].includes(ext)) return;
    
    let content = fs.readFileSync(filepath, 'utf8');
    let newContent = content
      .replace(/conectese/g, 'conectese')
      .replace(/Conectese/g, 'Conectese')
      .replace(/CONECTESE/g, 'CONECTESE')
      .replace(/conectese/g, 'conectese')
      .replace(/Conectese/g, 'Conectese')
      .replace(/Conectese/g, 'Conectese')
      .replace(/CONECTESE/g, 'CONECTESE');

    if (content !== newContent) {
      fs.writeFileSync(filepath, newContent, 'utf8');
    }
  } catch (err) {
    // skip files that can't be read as utf8
  }
}

const root = __dirname;
const pathsToRename = [];

walkSync(root, (filepath, isDir) => {
  if (!isDir) {
    replaceTextInFile(filepath);
  }
  
  const basename = path.basename(filepath);
  if (basename.includes('conectese') || basename.includes('conectese')) {
    pathsToRename.push({
      dir: path.dirname(filepath),
      oldName: basename,
      newName: basename.replace(/conectese/g, 'conectese').replace(/conectese/g, 'conectese')
    });
  }
});

// 2. Rename Files and Directories
// Because we used recursion, children are processed before their parents generally, but let's sort by depth descending
pathsToRename.sort((a, b) => b.dir.split(path.sep).length - a.dir.split(path.sep).length);

for (const { dir, oldName, newName } of pathsToRename) {
  const oldPath = path.join(dir, oldName);
  const newPath = path.join(dir, newName);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }
}

console.log('Renaming completed successfully!');
