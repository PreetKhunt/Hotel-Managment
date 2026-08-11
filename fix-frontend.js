const fs = require('fs');
const files = [
  'frontend/app/shopping-deals/page.tsx',
  'frontend/app/admin/explore-manali/page.tsx',
  'frontend/app/admin/shopping-deals/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/import { useToast } from '@\/hooks\/use-toast';/g, "import toast from 'react-hot-toast';");
  content = content.replace(/const { toast } = useToast\(\);/g, '');
  
  // Replace toast({ title: '...', description: '...', variant: 'destructive' }) with toast.error
  content = content.replace(/toast\(\{\s*title:\s*([^,]+),\s*description:\s*([^,]+),\s*variant:\s*'destructive'\s*\}\)/g, 'toast.error($2 || $1)');
  
  // Replace generic toast({ title: '...' }) with toast.success
  content = content.replace(/toast\(\{\s*title:\s*([^,]+)\s*\}\)/g, 'toast.success($1)');
  
  // Custom replace for ShoppingDeals handleClaimOffer
  content = content.replace(/toast\(\{\s*title:\s*"Coupon Generated Successfully!",\s*description:\s*"You can find your coupon in the dashboard.",\s*variant:\s*"default",\s*\}\);/g, 'toast.success("Coupon Generated Successfully! You can find your coupon in the dashboard.");');

  fs.writeFileSync(file, content);
}
console.log('Fixed toasts');
