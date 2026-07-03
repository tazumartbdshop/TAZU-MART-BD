const fs = require('fs');

const baseContent = fs.readFileSync('src/pages/admin/AdminMarketingTracking.tsx', 'utf8');

fs.writeFileSync('src/pages/admin/AdminMarketingFacebook.tsx', '');
fs.writeFileSync('src/pages/admin/AdminMarketingTikTok.tsx', '');
fs.writeFileSync('src/pages/admin/AdminMarketingGoogle.tsx', '');
fs.writeFileSync('src/pages/admin/AdminMarketingServerSide.tsx', '');
fs.writeFileSync('src/pages/admin/AdminMarketingTrackingOverview.tsx', '');
