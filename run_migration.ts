import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data } = await supabase.from('settings').select('value').eq('id', 'footer_config_v2').single();
  if (data && data.value) {
    let parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    
    // Check if we need to remove the 4 items
    const oldLinks = ['Home', 'Categories', 'Flash Sale', 'New Arrival'];
    if (parsed.quickLinks && Array.isArray(parsed.quickLinks)) {
      parsed.quickLinks = parsed.quickLinks.filter((l: any) => !oldLinks.includes(l.label));
      
      // Ensure the new ones exist
      const required = ['Brands', 'About Us', 'Contact Us', 'Privacy Policy', 'Terms & Conditions', 'Refund Policy'];
      required.forEach(r => {
        if (!parsed.quickLinks.find((l: any) => l.label === r)) {
          const urlMap: Record<string, string> = {
            'Brands': '/brands', 'About Us': '/about-us', 'Contact Us': '/contact-us',
            'Privacy Policy': '/privacy-policy', 'Terms & Conditions': '/terms-and-conditions', 'Refund Policy': '/refund-policy'
          };
          parsed.quickLinks.push({ label: r, url: urlMap[r] });
        }
      });
      
      await supabase.from('settings').update({ value: JSON.stringify(parsed) }).eq('id', 'footer_config_v2');
      console.log('Migrated footer_config_v2');
    }
  }
}
run();
