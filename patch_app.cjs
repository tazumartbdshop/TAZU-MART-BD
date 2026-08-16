const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace import
content = content.replace("import OfferPage from './pages/OfferPage';", "import CampaignProductsPage from './pages/CampaignProductsPage';");
// replace route
content = content.replace("<Route path=\"offer-page\" element={<OfferPage />} />", "<Route path=\"campaign/:id\" element={<CampaignProductsPage />} />");

fs.writeFileSync('src/App.tsx', content);
