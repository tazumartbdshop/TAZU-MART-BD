import { getSupabase } from '../lib/supabase';

const LOCAL_STORAGE_KEY_BASE = 'tazu_business_page_';

export interface ValidationResult {
  isValid: boolean;
  missingTable?: string;
  missingColumns?: string[];
  errorMessage?: string;
  sqlSnippet?: string;
}

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS public.flutter_pages (
    page_type TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    banner_image TEXT,
    phone TEXT,
    email TEXT,
    whatsapp TEXT,
    address TEXT,
    support_hours TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);`;

export const businessPagesService = {
  async validateDatabaseSchema(): Promise<ValidationResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        isValid: false,
        missingTable: 'flutter_pages',
        errorMessage: 'Required table not found: flutter_pages\nPlease create the flutter_pages table in Supabase.',
        sqlSnippet: CREATE_TABLE_SQL
      };
    }

    // 1. Check if table 'flutter_pages' exists
    const { error: tableError } = await supabase
      .from('flutter_pages')
      .select('page_type')
      .limit(1);

    if (tableError) {
      const errStr = (tableError.message || '').toLowerCase();
      if (
        tableError.code === '42P01' ||
        tableError.code === 'PGRST205' ||
        errStr.includes('does not exist') ||
        errStr.includes('not found') ||
        errStr.includes('relation') ||
        errStr.includes('schema cache')
      ) {
        return {
          isValid: false,
          missingTable: 'flutter_pages',
          errorMessage: 'Required table not found: flutter_pages\nPlease create the flutter_pages table in Supabase.',
          sqlSnippet: CREATE_TABLE_SQL
        };
      }
    }

    // 2. Check required columns sequentially
    const requiredColumns = [
      'page_type',
      'title',
      'content',
      'banner_image',
      'phone',
      'email',
      'whatsapp',
      'address',
      'support_hours',
      'updated_at'
    ];

    const missingColumns: string[] = [];

    for (const col of requiredColumns) {
      const { error: colError } = await supabase
        .from('flutter_pages')
        .select(col)
        .limit(1);

      if (colError) {
        const colErrStr = (colError.message || '').toLowerCase();
        if (
          colError.code === '42703' ||
          colError.code === 'PGRST204' ||
          colErrStr.includes('column') ||
          colErrStr.includes('does not exist') ||
          colErrStr.includes('schema cache')
        ) {
          missingColumns.push(col);
        }
      }
    }

    if (missingColumns.length > 0) {
      const messages = missingColumns.map(col => `Missing column: ${col}`);
      messages.push(`Please add column${missingColumns.length > 1 ? 's' : ''} to table flutter_pages.`);

      return {
        isValid: false,
        missingColumns,
        errorMessage: messages.join('\n'),
        sqlSnippet: missingColumns.map(col => `ALTER TABLE public.flutter_pages ADD COLUMN IF NOT EXISTS ${col} TEXT;`).join('\n')
      };
    }

    return { isValid: true };
  },

  async getPageData<T>(pageId: string, defaultData: T): Promise<T> {
    const supabase = getSupabase();
    
    // First try fetching from flutter_pages table
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('flutter_pages')
          .select('*')
          .eq('page_type', pageId)
          .maybeSingle();

        if (!error && data?.content) {
          try {
            const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
            localStorage.setItem(LOCAL_STORAGE_KEY_BASE + pageId, JSON.stringify(parsed));
            return parsed as T;
          } catch (e) {
            return { ...(defaultData as any), content: data.content, title: data.title } as T;
          }
        }
      } catch (err) {
        // Fallback below
      }
    }

    // Fallback to settings table
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('id', `business_page_${pageId}`)
          .maybeSingle();
          
        if (!error && data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          localStorage.setItem(LOCAL_STORAGE_KEY_BASE + pageId, JSON.stringify(parsed));
          return parsed as T;
        }
      } catch (err) {}
    }

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_BASE + pageId);
      if (cached) return JSON.parse(cached);
    } catch (e) {}

    return defaultData;
  },

  async savePageData<T>(
    pageId: string, 
    pageData: T, 
    pageTitle?: string
  ): Promise<{ success: boolean; validationResult?: ValidationResult; message?: string }> {
    // 1. Required field check
    if (!pageData || (typeof pageData === 'object' && Object.keys(pageData as object).length === 0)) {
      return {
        success: false,
        validationResult: {
          isValid: false,
          errorMessage: 'Required fields validation failed: Content cannot be empty.'
        }
      };
    }

    // 2. Check Database Schema
    const validation = await this.validateDatabaseSchema();
    if (!validation.isValid) {
      return {
        success: false,
        validationResult: validation
      };
    }

    // 3. Save to flutter_pages table
    const supabase = getSupabase();
    if (supabase) {
      try {
        const record = {
          page_type: pageId,
          title: pageTitle || (pageData as any)?.title || (pageData as any)?.companyName || pageId,
          content: JSON.stringify(pageData),
          banner_image: (pageData as any)?.banner || (pageData as any)?.banner_image || (pageData as any)?.logo || '',
          phone: (pageData as any)?.phone || (pageData as any)?.call || '',
          email: (pageData as any)?.email || '',
          whatsapp: (pageData as any)?.whatsapp || '',
          address: (pageData as any)?.companyAddress || (pageData as any)?.address || '',
          support_hours: (pageData as any)?.support_hours || '',
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('flutter_pages')
          .upsert(record, { onConflict: 'page_type' });

        if (error) {
          throw error;
        }
      } catch (err: any) {
        console.error(`Error saving to flutter_pages for ${pageId}:`, err);
        return {
          success: false,
          validationResult: {
            isValid: false,
            errorMessage: `Database save failed: ${err?.message || 'Unknown error'}`
          }
        };
      }
    }

    // 4. Save to localStorage & settings table cache for instant backup
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_BASE + pageId, JSON.stringify(pageData));
    } catch (e) {}

    if (supabase) {
      try {
        await supabase
          .from('settings')
          .upsert({
            id: `business_page_${pageId}`,
            value: JSON.stringify(pageData)
          });
      } catch (e) {}
    }

    return {
      success: true,
      message: 'Content saved successfully.'
    };
  }
};

