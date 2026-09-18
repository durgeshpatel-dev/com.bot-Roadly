const fs = require('fs');
const path = require('path');

function findFileInSrc(basename) {
  function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else {
        results.push(file);
      }
    });
    return results;
  }
  const allFiles = walk('client/src');
  for (let file of allFiles) {
    let name = path.parse(file).name;
    if (name === basename) {
      let rel = path.relative('client/src', file);
      rel = rel.replace(/\\/g, '/').replace(/\.tsx?$/, '');
      return '@/' + rel;
    }
  }
  return null;
}

function processClientTests() {
  function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else {
        results.push(file);
      }
    });
    return results;
  }
  
  const testFiles = walk('testing/client');
  testFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace import ... from '../...'
    const importRegex = /(from\s+['"])([\.\/]+)(.*?)(['"])/g;
    content = content.replace(importRegex, (match, p1, p2, p3, p4) => {
      if (!p2.includes('.')) return match; // Not relative
      const basename = path.basename(p3);
      if (!basename) return match;
      const alias = findFileInSrc(basename);
      if (alias) {
        return p1 + alias + p4;
      }
      return match;
    });
    
    // Replace vi.mock('../...')
    const mockRegex = /(vi\.mock\(['"])([\.\/]+)(.*?)(['"])/g;
    content = content.replace(mockRegex, (match, p1, p2, p3, p4) => {
      if (!p2.includes('.')) return match;
      const basename = path.basename(p3);
      if (!basename) return match;
      const alias = findFileInSrc(basename);
      if (alias) {
        return p1 + alias + p4;
      }
      return match;
    });

    fs.writeFileSync(file, content);
  });
}

processClientTests();
console.log('Client test imports fixed.');
