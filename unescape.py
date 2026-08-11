import os

files = [
  'frontend/app/explore-manali/page.tsx',
  'frontend/app/shopping-deals/page.tsx',
  'frontend/app/admin/explore-manali/page.tsx',
  'frontend/app/admin/shopping-deals/page.tsx'
]

for f in files:
  if not os.path.exists(f): 
      print(f"{f} not found")
      continue
  with open(f, 'r', encoding='utf-8') as file:
    content = file.read()
  
  content = content.replace('\\`', '`').replace('\\${', '${')
  
  with open(f, 'w', encoding='utf-8') as file:
    file.write(content)

print('Unescaped backticks')
