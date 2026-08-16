const fs = require('fs');
const file = 'src/pages/admin/AdminPushNotifications.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
code = code.replace("import { usePromoStore } from '../../store/usePromoStore';", 
  "import { usePromoStore } from '../../store/usePromoStore';\nimport { campaignService, Campaign } from '../../services/campaignService';");

// Use state for campaigns
code = code.replace("const [copiedCode, setCopiedCode] = useState(false);", 
  "const [copiedCode, setCopiedCode] = useState(false);\n  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);\n  useEffect(() => { campaignService.getCampaigns().then(setDbCampaigns).catch(console.error); }, [currentTab]);");

// Limit textareas
code = code.replace("value={title}", "value={title}\n                          maxLength={60}");
code = code.replace("value={description}", "value={description}\n                          maxLength={160}");

// Image limit 2MB
code = code.replace("if (file.size > 5 * 1024 * 1024) {", "if (file.size > 2 * 1024 * 1024) {");
code = code.replace("triggerToast('⚠️ File size exceeds 5MB limit');", "triggerToast('⚠️ File size exceeds 2MB limit (1200x800 recommended)');");

// Replace handlePublishCampaign logic to save in Campaign DB
const publishFuncStr = `
  const handlePublishCampaign = async (status: 'Published' | 'Draft' = 'Published') => {
    if (!title.trim()) {
      triggerToast('⚠️ Title is required');
      return;
    }
    if (!description.trim()) {
      triggerToast('⚠️ Description is required');
      return;
    }
    if (!coverImage.trim()) {
      triggerToast('⚠️ Campaign Banner Image is required (1200x800)');
      return;
    }

    try {
      const finalCoupon = hasCoupon && couponCode.trim() ? couponCode.trim().toUpperCase() : undefined;
      const dbStatus = status === 'Published' ? 'active' : 'draft';
      
      let couponData = undefined;
      if (finalCoupon) {
        couponData = {
          code: finalCoupon,
          description: couponDesc.trim() || 'Campaign Coupon',
          discount_type: discountType,
          discount_value: Number(discountAmount) || 10,
          active: true,
          expires_at: new Date(expiryDate).toISOString()
        };
        // Also save to promo store for backward compatibility
        await addPromoCode({
          name: couponDesc.trim() || \`\${finalCoupon} Campaign Coupon\`,
          code: finalCoupon,
          type: discountType,
          value: Number(discountAmount) || 10,
          minOrder: 0,
          expiryDate: expiryDate || '2026-12-31',
          usageLimit: 1000,
          status: 'Active'
        });
      }

      await campaignService.createCampaign(
        {
          title: title.trim(),
          description: description.trim(),
          image_url: coverImage.trim(),
          status: dbStatus,
          start_at: new Date().toISOString(),
          end_at: new Date(expiryDate).toISOString(),
        },
        selectedProductIds,
        selectedCategories,
        couponData
      );
      
      triggerToast(\`✅ Campaign successfully saved to Database (\${dbStatus})\`);
      setTitle('');
      setDescription('');
      setCoverImage('');
      setCouponCode('');
      setHasCoupon(false);
      setSelectedCategories([]);
      setSelectedProductIds([]);
      setCurrentTab('history');
      campaignService.getCampaigns().then(setDbCampaigns).catch(console.error);
    } catch (e: any) {
      triggerToast('❌ Error saving campaign: ' + e.message);
    }
  };
`;

const regex = /const handlePublishCampaign = async.*?};/s;
code = code.replace(regex, publishFuncStr.trim());

fs.writeFileSync(file, code);
