const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /app\.post\("\/api\/promo\/validate", async \(req, res\) => \{[\s\S]*?res\.json\(\{ \s*isValid: true[\s\S]*?\}\);\s*\} catch \(error\) \{/s;

const replacement = `app.post("/api/promo/validate", async (req, res) => {
    try {
      const { code, subtotal, items } = req.body;
      
      if (!code) {
        return res.json({ isValid: false, state: 'invalid', message: "❌ Promo Code পাওয়া যায়নি।" });
      }
      
      const client = supabaseServiceRole || supabaseAdmin;
      
      // Check in campaigns first (via settings since no DDL)
      let campaignMatched = null;
      if (client) {
        const { data: setts } = await client.from('settings').select('value').eq('id', 'campaigns_data').single();
        if (setts && setts.value) {
          const matchedData = setts.value.find((c) => c.coupon && c.coupon.code.toUpperCase() === code.trim().toUpperCase() && c.coupon.active);
          if (matchedData) {
            campaignMatched = matchedData;
          }
        }
      }

      let matchingPromo = null;
      
      if (campaignMatched) {
        // Construct promo object from campaign
        matchingPromo = {
          id: campaignMatched.campaign.id,
          code: campaignMatched.coupon.code,
          type: campaignMatched.coupon.discount_type,
          value: campaignMatched.coupon.discount_value,
          status: 'Active',
          expiryDate: campaignMatched.campaign.end_at ? campaignMatched.campaign.end_at.split('T')[0] : '2099-12-31',
          minOrder: 0
        };
        
        // Product specific check
        if (campaignMatched.products && campaignMatched.products.length > 0 && items && items.length > 0) {
          const allowedIds = campaignMatched.products.map(p => String(p.product_id));
          const hasApplicableProduct = items.some(item => allowedIds.includes(String(item.id)));
          if (!hasApplicableProduct) {
             return res.json({ isValid: false, state: 'invalid', message: "❌ এই কুপনটি আপনার কার্টে থাকা পণ্যের জন্য প্রযোজ্য নয়।" });
          }
        }
      } else {
        // Fallback to old promo codes
        const { data: promos } = client ? await client.from('promo_codes').select('*').ilike('code', code.trim()) : { data: null };
        if (promos && promos.length > 0) matchingPromo = promos[0];
      }
      
      if (!matchingPromo) {
        return res.json({ isValid: false, state: 'invalid', message: "❌ Promo Code পাওয়া যায়নি।" });
      }
      
      if (matchingPromo.status === 'Inactive' || matchingPromo.status === 'Disabled') {
        return res.json({ isValid: false, state: 'inactive', message: "❌ এই Promo Code বর্তমানে সক্রিয় নয়।" });
      }
      
      const expiryDate = new Date(matchingPromo.expiryDate + "T23:59:59");
      const today = new Date();
      if (expiryDate < today) {
        return res.json({ isValid: false, state: 'expired', message: "❌ এই Promo Code-এর মেয়াদ শেষ।" });
      }
      
      if (matchingPromo.minOrder && subtotal < matchingPromo.minOrder) {
        return res.json({ isValid: false, state: 'invalid', message: \`❌ অন্তত ৳\${matchingPromo.minOrder} টাকার অর্ডার করতে হবে।\` });
      }
      
      let discountAmount = 0;
      if (matchingPromo.type === 'Percentage') {
        discountAmount = Math.round((subtotal * matchingPromo.value) / 100);
      } else {
        discountAmount = matchingPromo.value;
      }
      
      if (discountAmount > subtotal) {
        discountAmount = subtotal; // Cannot exceed
      }
      
      return res.json({ 
        isValid: true, 
        promo: matchingPromo,
        discountAmount,
        message: "✅ Promo Code Successfully Applied!"
      });
    } catch (error) {`;

code = code.replace(regex, replacement);
fs.writeFileSync(file, code);
