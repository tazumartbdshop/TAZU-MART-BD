const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminMarketingTrackingOverview.tsx', 'utf8');
code = code.replace(/<div className="border border-zinc-200 p-6 space-y-5">/, '<div className="border border-zinc-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">');
code = code.replace(/<div className="pt-4 border-t border-zinc-100 flex items-center justify-between">/, '<div className="col-span-1 md:col-span-2 pt-4 border-t border-zinc-100 flex items-center justify-between">');
fs.writeFileSync('src/pages/admin/AdminMarketingTrackingOverview.tsx', code);
