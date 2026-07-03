const fs = require('fs');

const files = [
  'src/pages/admin/AdminMarketingFacebook.tsx',
  'src/pages/admin/AdminMarketingTikTok.tsx',
  'src/pages/admin/AdminMarketingGoogle.tsx',
  'src/pages/admin/AdminMarketingServerSide.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  // replace <div className="space-y-4"> with <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  code = code.replace(/<div className="space-y-4">/, '<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">');
  // wait, the checkboxes should span full width or be inside a container that spans full width
  code = code.replace(/<div className="pt-2 space-y-3">/, '<div className="col-span-1 md:col-span-2 pt-2 space-y-3">');
  fs.writeFileSync(file, code);
}
