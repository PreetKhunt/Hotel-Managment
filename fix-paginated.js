const fs = require('fs');

let file = 'frontend/types/shopping.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/export interface PaginatedResult<T> \{\s*data: T\[\];\s*total: number;\s*\}\s*/g, '');
fs.writeFileSync(file, content);

file = 'frontend/lib/api/shopping.ts';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/from '\.\.\/\.\.\/types\/shopping';/g, "from '../../types';");
fs.writeFileSync(file, content);

console.log('Fixed PaginatedResult duplicate');
