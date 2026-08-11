const fs = require('fs');

const controllers = [
  'src/controllers/manaliController.ts',
  'src/controllers/shoppingController.ts'
];

for (const file of controllers) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix AppError args (which got replaced with empty strings)
  content = content.replace(/new AppError\(, 404, ErrorCode\.NOT_FOUND\)/g, "new AppError('Not found', 404, ErrorCode.NOT_FOUND)");
  content = content.replace(/new AppError\(, 400, ErrorCode\.VALIDATION_ERROR\)/g, "new AppError('Validation Error', 400, ErrorCode.VALIDATION_ERROR)");
  
  // Fix _req back to req where it's actually used
  content = content.replace(/_req: Request/g, "req: Request");

  // Only replace specific unused request fields
  content = content.replace(/public getTravelTips = async \(req: Request/g, "public getTravelTips = async (_req: Request");
  content = content.replace(/public getEmergencyContacts = async \(req: Request/g, "public getEmergencyContacts = async (_req: Request");
  content = content.replace(/public getTransport = async \(req: Request/g, "public getTransport = async (_req: Request");

  fs.writeFileSync(file, content);
}
