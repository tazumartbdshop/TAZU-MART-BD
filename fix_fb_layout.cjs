const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminMarketingFacebook.tsx', 'utf8');
code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">/, '<div className="space-y-4">');
code = code.replace(/<div className="col-span-1 md:col-span-2 pt-2 space-y-3">/, '<div className="pt-2 space-y-3">');
fs.writeFileSync('src/pages/admin/AdminMarketingFacebook.tsx', code);
