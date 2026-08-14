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
    return 'white';
  },

  async saveThemeMode(themeMode: ThemeMode): Promise<{ success: boolean; message?: string }> {
    this.applyThemeModeToApp('white');
    return {
      success: true,
      message: 'Theme set to White.'
    };
  },

  applyThemeModeToApp(themeMode: ThemeMode = 'white') {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.setAttribute('data-footer-theme', 'light');

    if (typeof window !== 'undefined') {
      localStorage.setItem('tazu_theme_mode', 'light');
    }

    // Broadcast event so any listener updates to white
    window.dispatchEvent(new CustomEvent('tazu-theme-mode-changed', { detail: 'white' }));

    // Update Zustand useThemeStore
    const store = useThemeStore.getState();
    store.setThemeModeState('light');
  }
};
