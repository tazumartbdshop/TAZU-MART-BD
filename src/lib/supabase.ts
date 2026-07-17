import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { getApiUrl } from '../utils/apiUrl';


class MySqlBuilder {
  private tableName: string;
  private method: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private payload: any = null;
  private filters: any[] = [];
  private orderBy: any = null;
  private limitCount: number | null = null;
  private isSingle = false;
  private isMaybeSingle = false;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.then = this.then.bind(this);
  }

  select(cols: string = '*') {
    if (this.method === 'select') {
      this.method = 'select';
    }
    return this;
  }

  insert(data: any) {
    this.method = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.method = 'update';
    this.payload = data;
    return this;
  }

  upsert(data: any) {
    this.method = 'upsert';
    this.payload = data;
    return this;
  }

  delete() {
    this.method = 'delete';
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ type: 'eq', col, val });
    return this;
  }

  neq(col: string, val: any) {
    this.filters.push({ type: 'neq', col, val });
    return this;
  }

  like(col: string, val: any) {
    this.filters.push({ type: 'like', col, val });
    return this;
  }

  ilike(col: string, val: any) {
    this.filters.push({ type: 'ilike', col, val });
    return this;
  }

  in(col: string, val: any[]) {
    this.filters.push({ type: 'in', col, val });
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderBy = { col, ascending: options?.ascending !== false };
    return this;
  }

  limit(num: number) {
    this.limitCount = num;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    const promise = (async () => {
      try {
        const res = await fetch(getApiUrl('/api/mysql-proxy'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            table: this.tableName,
            method: this.method,
            payload: this.payload,
            filters: this.filters,
            orderBy: this.orderBy,
            limitCount: this.limitCount,
            isSingle: this.isSingle,
            isMaybeSingle: this.isMaybeSingle
          })
        });

        if (!res.ok) {
          throw new Error(`MySQL Proxy error: ${res.statusText}`);
        }

        const data = await res.json();
        return {
          data: data.data,
          error: data.error ? { message: data.error, code: data.error_code || '' } : null,
          count: data.count || 0,
          status: res.status,
          statusText: res.statusText
        };
      } catch (err: any) {
        console.error("[MySqlBuilder Error]", err);
        return {
          data: null,
          error: { message: err.message || 'Database connection error', code: 'CONNECTION_FAILURE' },
          count: 0,
          status: 500,
          statusText: 'Internal Server Error'
        };
      }
    })();

    return promise.then(onfulfilled, onrejected);
  }
}

class MySqlAuth {
  private listeners: ((event: string, session: any) => void)[] = [];

  constructor() {
    // Listen to auth state
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    
    // Trigger callback with initial state
    const session = this.getSessionSync();
    setTimeout(() => {
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    }, 100);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  trigger(event: string, session: any) {
    this.listeners.forEach(l => {
      try {
        l(event, session);
      } catch (e) {
        console.error("[Auth Trigger Error]", e);
      }
    });
  }

  private getSessionSync() {
    try {
      const stored = localStorage.getItem('luxemart-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.state && parsed.state.user) {
          const user = parsed.state.user;
          return {
            user: {
              id: user.id,
              email: user.email,
              user_metadata: {
                name: user.name,
                phone: user.phone || '',
                profileImage: user.profileImage || ''
              }
            }
          };
        }
      }
    } catch (e) {}
    return null;
  }

  async signUp(payload: any) {
    try {
      const res = await fetch(getApiUrl('/api/mysql-proxy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'users',
          method: 'signUp',
          payload
        })
      });
      const result = await res.json();
      if (!result.error && result.data?.session) {
        this.trigger('SIGNED_IN', result.data.session);
      }
      return result;
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err.message || 'Signup failed' } };
    }
  }

  async signInWithPassword(payload: any) {
    try {
      const res = await fetch(getApiUrl('/api/mysql-proxy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'users',
          method: 'signInWithPassword',
          payload
        })
      });
      const result = await res.json();
      if (!result.error && result.data?.session) {
        this.trigger('SIGNED_IN', result.data.session);
      }
      return result;
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err.message || 'Login failed' } };
    }
  }

  async signOut() {
    localStorage.removeItem('luxemart-auth');
    this.trigger('SIGNED_OUT', null);
    return { error: null };
  }

  async getSession() {
    return { data: { session: this.getSessionSync() }, error: null };
  }

  async updateUser(updatedUser: any) {
    try {
      const session = this.getSessionSync();
      if (!session?.user?.id) return { error: 'Not logged in' };
      const res = await fetch(getApiUrl('/api/mysql-proxy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'users',
          method: 'update',
          payload: updatedUser,
          filters: [{ type: 'eq', col: 'id', val: session.user.id }]
        })
      });
      return await res.json();
    } catch (err: any) {
      return { error: err.message || 'Update failed' };
    }
  }
}

const authInstance = new MySqlAuth();

class MockChannel {
  on(event: string, config: any, callback: any) {
    return this;
  }
  subscribe() {
    return this;
  }
}


const realSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const realSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock';
const realSupabase = createClient(realSupabaseUrl, realSupabaseKey);

// Client Mock Instance
const clientMockInstance = {
  from: (tableName: string) => new MySqlBuilder(tableName),
  auth: authInstance,
  channel: (name: string) => new MockChannel(),
  removeChannel: (channel: any) => {},
  storage: realSupabase.storage,
};

export const getSupabaseCredentials = () => {
  return { url: 'mysql-proxy', key: 'mysql-proxy' };
};

export const getSupabase = (): SupabaseClient | null => {
  return clientMockInstance as unknown as SupabaseClient;
};

export const supabase = clientMockInstance as unknown as SupabaseClient;

export const fetchSupabaseConfigFromServer = async (): Promise<boolean> => {
  return true;
};
