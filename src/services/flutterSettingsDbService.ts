import { getSupabase } from '../lib/supabase';
import { FooterSettings } from './footerSettingsService';
import { ThemeMode } from './themeSettingsService';

export interface FlutterSettingsDbResult {
  success: boolean;
  errorType?: 'TABLE_MISSING' | 'COLUMNS_MISSING' | 'SAVE_FAILED';
  message: string;
  missingColumns?: string[];
  sqlInstruction?: string;
}

export const REQUIRED_FLUTTER_SETTINGS_COLUMNS = [
  'id',
  'company_name',
  'footer_logo',
  'theme',
  'footer_description',
  'feature_messages',
  'quick_links',
  'created_at',
  'updated_at'
];

export const flutterSettingsDbService = {
  /**
   * Validates flutter_settings table and required columns, then upserts data.
   */
  async verifyAndSaveFlutterSettings(
    settings: FooterSettings, 
    themeMode: ThemeMode
  ): Promise<FlutterSettingsDbResult> {
    const supabase = getSupabase();

    if (!supabase) {
      return {
        success: false,
        errorType: 'SAVE_FAILED',
        message: 'Supabase client is not initialized.'
      };
    }

    // Step 1: Check table existence
    const { error: tableError } = await supabase
      .from('flutter_settings')
      .select('id')
      .limit(1);

    if (tableError) {
      const errMsg = tableError.message || '';
      const errCode = tableError.code || '';
      const isMissingTable = 
        errCode === '42P01' || 
        errMsg.toLowerCase().includes('relation') || 
        errMsg.toLowerCase().includes('does not exist') || 
        errMsg.toLowerCase().includes('table');

      if (isMissingTable) {
        return {
          success: false,
          errorType: 'TABLE_MISSING',
          message: 'Table flutter_settings does not exist. Please create it first.',
          sqlInstruction: `CREATE TABLE IF NOT EXISTS public.flutter_settings (
  id TEXT PRIMARY KEY,
  company_name TEXT,
  footer_logo TEXT,
  theme TEXT,
  footer_description TEXT,
  feature_messages JSONB,
  quick_links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`
        };
      }
    }

    // Step 2: Check required columns
    const missingColumns: string[] = [];
    for (const col of REQUIRED_FLUTTER_SETTINGS_COLUMNS) {
      const { error: colError } = await supabase
        .from('flutter_settings')
        .select(col)
        .limit(1);

      if (colError) {
        const errMsg = colError.message || '';
        const errCode = colError.code || '';
        const isMissingCol = 
          errCode === '42703' || 
          errMsg.toLowerCase().includes('column') || 
          errMsg.toLowerCase().includes('does not exist') || 
          errMsg.toLowerCase().includes('undefined_column');

        if (isMissingCol) {
          missingColumns.push(col);
        }
      }
    }

    if (missingColumns.length > 0) {
      const alterSql = missingColumns.map(col => {
        let colType = 'TEXT';
        if (col === 'feature_messages' || col === 'quick_links') colType = 'JSONB';
        if (col === 'created_at' || col === 'updated_at') colType = 'TIMESTAMPTZ DEFAULT NOW()';
        return `ALTER TABLE public.flutter_settings ADD COLUMN IF NOT EXISTS ${col} ${colType};`;
      }).join('\n');

      return {
        success: false,
        errorType: 'COLUMNS_MISSING',
        missingColumns,
        message: `Missing required column(s) in flutter_settings: ${missingColumns.join(', ')}. Please add them first.`,
        sqlInstruction: alterSql
      };
    }

    // Step 3: Insert / Update settings to flutter_settings table
    const defaultFeatureMessages = [
      { id: 1, icon: 'Truck', text: 'Fast Delivery Across Bangladesh', bnText: '🚚 দ্রুত হোম ডেলিভারি সারা বাংলাদেশে' },
      { id: 2, icon: 'ShieldCheck', text: 'Secure Payment', bnText: '🔒 ১০০% নিরাপদ পেমেন্ট ও ক্যাশ অন ডেলিভারি' },
      { id: 3, icon: 'CheckCircle2', text: 'Trusted Online Shop', bnText: '✅ বিশ্বস্ত ও নির্ভরযোগ্য অনলাইন শপ' },
      { id: 4, icon: 'Sparkles', text: '100% Authentic Products', bnText: '💯 ১০০% অরজিনাল ও প্রিমিয়াম প্রোডাক্ট' },
      { id: 5, icon: 'Gift', text: 'Best Deals Every Day', bnText: '🎁 প্রতিদিন সেরা ডিল ও অফার' },
      { id: 6, icon: 'Star', text: 'Premium Quality Guaranteed', bnText: '⭐ প্রিমিয়াম কোয়ালিটি নিশ্চিতকরণ' },
      { id: 7, icon: 'Headphones', text: 'Friendly Customer Support', bnText: '📞 ২৪/৭ বন্ধুত্বপূর্ণ কাস্টমার সাপোর্ট' }
    ];

    const payload = {
      id: '1',
      company_name: settings.companyName || '',
      footer_logo: settings.footerLogoUrl || '',
      theme: themeMode || 'white',
      footer_description: settings.businessDescription || '',
      feature_messages: defaultFeatureMessages,
      quick_links: settings.quickLinks || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabase
      .from('flutter_settings')
      .upsert(payload, { onConflict: 'id' });

    if (upsertError) {
      return {
        success: false,
        errorType: 'SAVE_FAILED',
        message: `Failed to save flutter_settings: ${upsertError.message}`
      };
    }

    return {
      success: true,
      message: 'Flutter settings saved successfully.'
    };
  }
};
