const fs = require('fs');
const file = 'src/pages/admin/AdminPushNotifications.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace history mapping
const regex = /\{notifications\.length > 0 \? \(\s*notifications\.map\(\(notif\) => \{/s;
const replacement = `{dbCampaigns.length > 0 ? (\n              dbCampaigns.map((camp: any) => {\n                const notif = camp; // reuse var names temporarily`;
code = code.replace(regex, replacement);

const regex2 = /\{notifications\.length === 0 && \(/s;
code = code.replace(regex2, `{dbCampaigns.length === 0 && (`);

// Replace deletion logic in history
code = code.replace("deleteNotification(notif.id)", "campaignService.deleteCampaign(notif.id).then(() => setDbCampaigns(prev => prev.filter(c => c.id !== notif.id)))");

// Fix `notif.bannerImage` -> `notif.image_url`
code = code.replace("const cover = notif.coverImage || notif.bannerImage || companyLogoFallback;", "const cover = notif.image_url || companyLogoFallback;");
code = code.replace("createdAt", "created_at").replace("createdAt", "created_at"); // replace two occurrences

fs.writeFileSync(file, code);
