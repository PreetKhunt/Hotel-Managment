const fs = require('fs');
const files = [
  'app/explore/page.tsx',
  'app/dashboard/explore/page.tsx',
  'app/dashboard/shopping/page.tsx',
  'app/shopping/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix dark text classes
  content = content.replace(/\btext-slate-800\b/g, 'text-white');
  content = content.replace(/\btext-slate-900\b/g, 'text-white');
  content = content.replace(/\btext-gray-800\b/g, 'text-white');
  content = content.replace(/\btext-gray-900\b/g, 'text-white');
  content = content.replace(/\btext-primary\b/g, 'text-white');
  
  // Fix secondary text
  content = content.replace(/\btext-secondary\b/g, 'text-slate-300');
  content = content.replace(/\btext-slate-600\b/g, 'text-slate-300');
  content = content.replace(/\btext-gray-600\b/g, 'text-slate-300');
  
  // Fix incorrect backgrounds
  content = content.replace(/\bbg-white\b/g, 'bg-surface-card');
  content = content.replace(/\bbg-slate-50\b/g, 'bg-surface-card');
  content = content.replace(/\bbg-slate-100\b/g, 'bg-surface-card');
  
  // Fix incorrect borders
  content = content.replace(/\bborder-slate-200\b/g, 'border-gold/20');
  content = content.replace(/\bborder-slate-100\b/g, 'border-gold/20');
  
  // Fix typo in activity card and other cards
  content = content.replace(/bg-green-500\/100\/10/g, 'bg-green-500/10');
  content = content.replace(/bg-amber-500\/100\/10/g, 'bg-amber-500/10');
  content = content.replace(/bg-red-500\/100\/100\/100\/10/g, 'bg-red-500/10');
  content = content.replace(/bg-blue-500\/100\/10/g, 'bg-blue-500/10');
  content = content.replace(/bg-emerald-500\/100\/10/g, 'bg-emerald-500/10');

  // Fix Specific text-black that shouldn't be there
  content = content.replace(/\btext-black\b/g, 'text-white');

  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
});
