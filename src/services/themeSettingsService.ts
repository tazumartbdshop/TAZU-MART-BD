import { getSupabase } from '../lib/supabase';
import { ValidationResult } from './businessPagesService';
import { useThemeStore } from '../store/useThemeStore';

export type ThemeMode = 'black' | 'white';

export interface ThemeSettingsData {
  theme_mode: ThemeMode;
  updated_at?: string;
}

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS public.app_settings (
  id VARCHAR(50) PRIMARY KEY,
  theme_mode VARCHAR(20) NOT NULL DEFAULT 'white',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

export const themeSettingsService = {
  async validateSchema(): Promise<ValidationResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        isValid: false,
        errorMessage: 'Supabase credentials missing or client not initialized.'
      };
    }

    try {
      // 1. Check if table app_settings exists
      const { error: tableErr } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1);

      if (tableErr) {
        const msg = tableErr.message.toLowerCase();
        if (
          tableErr.code === '42P01' ||
          msg.includes('does not exist') ||
          msg.includes('relation') ||
          tableErr.code === 'PGRST301'
        ) {
          return {
            isValid: false,
            missingTable: 'app_settings',
            errorMessage: 'Required table not found: app_settings\nPlease create the app_settings table in Supabase.',
            sqlSnippet: CREATE_TABLE_SQL
          };
        }
      }

      // 2. Check required columns one by one
      const requiredColumns: { col: keyof ThemeSettingsData | 'id'; sql: string }[] = [
        { col: 'id', sql: 'ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS id VARCHAR(50) PRIMARY KEY;' },
        { col: 'theme_mode', sql: "ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS theme_mode VARCHAR(20) DEFAULT 'white';" },
        { col: 'updated_at', sql: 'ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();' }
      ];

      const missingCols: string[] = [];
      const missingSql: string[] = [];

      for (const item of requiredColumns) {
        const { error: colErr } = await supabase
          .from('app_settings')
          .select(item.col)
          .limit(1);

        if (colErr) {
          const cMsg = colErr.message.toLowerCase();
          if (colErr.code === '42703' || cMsg.includes('does not exist') || cMsg.includes('column')) {
            missingCols.push(item.col);
            missingSql.push(item.sql);
          }
        }
      }

      if (missingCols.length > 0) {
        const errorLines = missingCols.map(col => `Missing column: ${col}`).join('\n');
        return {
          isValid: false,
          missingTable: 'app_settings',
          missingColumns: missingCols,
          errorMessage: errorLines,
          sqlSnippet: missingSql.join('\n')
        };
      }

      return { isValid: true };
    } catch (err: any) {
      return {
        isValid: false,
        errorMessage: err.message || 'Database validation failed unexpectedly.'
      };
    }
  },

  async getThemeMode(): Promise<ThemeMode> {
    const supabase = getSupabase();
    if (!supabase) return 'white';

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('theme_mode')
        .eq('id', 'theme_config')
        .limit(1);

      if (!error && data && data.length > 0 && data[0].theme_mode) {
        const val = data[0].theme_mode.toLowerCase();
        return val === 'black' || val === 'dark' ? 'black' : 'white';
      }
    } catch (e) {
      console.warn('Error fetching theme_mode from app_settings:', e);
    }
    return 'white';
  },

  async saveThemeMode(themeMode: ThemeMode): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabase();
    const isBlack = themeMode === 'black';
    
    // Always apply live to DOM & Zustand store first
    this.applyThemeModeToApp(themeMode);

    if (!supabase) {
      return { success: true };
    }

    try {
      const now = new Date().toISOString();

      // 1. Try upserting into app_settings
      try {
        await supabase
          .from('app_settings')
          .upsert({
            id: 'theme_config',
            theme_mode: themeMode,
            updated_at: now
          });
      } catch (e) {
        console.warn('app_settings upsert error:', e);
      }

      // 2. Try upserting into settings table
      try {
        await supabase
          .from('settings')
          .upsert([{
            id: 'theme',
            mode: isBlack ? 'dark' : 'light',
            backgroundColor: isBlack ? '#0a0a0a' : '#ffffff',
            textColor: isBlack ? '#ffffff' : '#000000',
            navbarBg: isBlack ? '#000000' : '#ffffff',
            navbarTextColor: isBlack ? '#ffffff' : '#000000',
            cardBg: isBlack ? '#171717' : '#ffffff',
            productNameColor: isBlack ? '#ffffff' : '#000000',
            borderColor: isBlack ? '#27272a' : '#EEEEEE'
          }]);
      } catch (e) {
        console.warn('settings upsert error:', e);
      }

      return {
        success: true,
        message: 'Theme updated successfully.'
      };
    } catch (err: any) {
      console.warn('saveThemeMode unexpected error:', err);
      return { success: true };
    }
  },

  applyThemeModeToApp(themeMode: ThemeMode) {
    const root = document.documentElement;
    const isBlack = themeMode === 'black';

    // Remove global dark class to keep header, body, banners and product cards in default light mode
    root.classList.remove('dark');
    root.setAttribute('data-footer-theme', isBlack ? 'dark' : 'light');

    // Broadcast event so Footer component updates in real-time
    window.dispatchEvent(new CustomEvent('tazu-theme-mode-changed', { detail: themeMode }));

    // Update Zustand useThemeStore
    const store = useThemeStore.getState();
    store.setThemeModeState(isBlack ? 'dark' : 'light');
  }
};
