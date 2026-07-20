import * as mysql from 'mysql2/promise';

// MySQL Connection Config
const config = {
  host: '5.183.10.131',
  user: 'u103041740_tazumartbd',
  password: 'YOU@suf60679',
  database: 'u103041740_TAZU_MART_BD',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: {
    rejectUnauthorized: false
  }
};

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(config);
    (pool as any).on('error', (err: any) => {
      console.error('[MySQL Pool Error]', err);
    });
  }
  return pool;
}

export async function testConnection(): Promise<boolean> {
  const pool = getPool();
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('[MySQL Connection Test Error]', error);
    return false;
  }
}

export async function executeQuery(sql: string, params: any[] = []) {
  const activePool = getPool();
  try {
    const [results] = await activePool.execute(sql, params);
    return results;
  } catch (error: any) {
    console.error('[MySQL Execution Error] SQL:', sql, 'Params:', params, 'Error:', error.message);
    throw error;
  }
}

const tableColumnsCache: Record<string, string[]> = {};

async function getTableColumns(table: string, poolInstance: any): Promise<string[]> {
  const cached = tableColumnsCache[table];
  if (cached) return cached;
  try {
    const [rows]: any[] = await poolInstance.execute(`DESCRIBE \`${table}\``);
    const cols = rows.map((r: any) => r.Field);
    tableColumnsCache[table] = cols;
    return cols;
  } catch (err) {
    console.warn(`[getTableColumns] Failed to describe table ${table}:`, err);
    return [];
  }
}

async function filterAndMapPayload(table: string, payload: any, poolInstance: any): Promise<any> {
  if (!payload || typeof payload !== 'object') return payload;
  
  const columns = await getTableColumns(table, poolInstance);
  if (columns.length === 0) return payload; // Fallback if query fails
  
  const hasValueCol = columns.includes('value');
  const hasSettingsValueCol = columns.includes('settings_value');
  
  const mapping: Record<string, string> = {
    'store_name': 'name',
    'storeName': 'name',
    'primary_logo': 'logo',
    'primaryLogo': 'logo',
    'store_logo': 'logo',
    'storeLogo': 'logo',
    'contact_number': 'contactPhone',
    'contactNumber': 'contactPhone',
    'support_email': 'contactEmail',
    'supportEmail': 'contactEmail',
    'store_email': 'contactEmail',
    'storeEmail': 'contactEmail',
    'store_description': 'address',
    'storeDescription': 'address',
    'house_building': 'address',
    'houseBuilding': 'address'
  };

  const processed: any = {};
  const extraFields: any = {};
  const colSet = new Set(columns);

  Object.keys(payload).forEach(key => {
    let val = payload[key];
    
    // Check if the key matches a column directly
    if (colSet.has(key)) {
      processed[key] = val;
      return;
    }
    
    // Check mapped versions of keys
    const mappedKey = mapping[key];
    if (mappedKey && colSet.has(mappedKey)) {
      processed[mappedKey] = val;
      return;
    }
    
    // Store remaining unrecognized keys in extraFields
    extraFields[key] = val;
  });

  // If there are extra fields and the table supports a generic 'value' or 'settings_value' JSON store column:
  if (Object.keys(extraFields).length > 0) {
    if (hasValueCol) {
      let parsedVal: any = {};
      if (processed['value']) {
        try {
          parsedVal = typeof processed['value'] === 'string' ? JSON.parse(processed['value']) : processed['value'];
        } catch(e) {}
      }
      processed['value'] = { ...parsedVal, ...extraFields };
    } else if (hasSettingsValueCol) {
      let parsedVal: any = {};
      if (processed['settings_value']) {
        try {
          parsedVal = typeof processed['settings_value'] === 'string' ? JSON.parse(processed['settings_value']) : processed['settings_value'];
        } catch(e) {}
      }
      processed['settings_value'] = { ...parsedVal, ...extraFields };
    }
  }

  return processed;
}

export async function executeProxyQuery(query: {
  table: string;
  method: 'select' | 'insert' | 'update' | 'delete' | 'upsert' | 'signUp' | 'signInWithPassword';
  payload?: any;
  filters?: { type: string; col: string; val: any }[];
  orderBy?: { col: string; ascending: boolean } | null;
  limitCount?: number | null;
  isSingle?: boolean;
  isMaybeSingle?: boolean;
}, retryCount = 0): Promise<any> {
  const { table, method, payload, filters = [], orderBy, limitCount, isSingle, isMaybeSingle } = query;
  
  const poolInstance = getPool();
  
  try {
    let sql = '';
    const params: any[] = [];

    // Custom Auth Methods
    if (method === 'signUp') {
      const { email, password, options = {} } = payload;
      const metadata = options.data || {};
      
      // Check if user already exists
      const [existing]: any[] = await poolInstance.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (existing && existing.length > 0) {
        return { data: { user: null, session: null }, error: 'User already exists' };
      }
      
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const name = metadata.name || metadata.fullName || email.split('@')[0] || 'Registered User';
      const role = 'customer';
      const status = 'Active';
      const createdAt = new Date().toISOString();
      const phone = metadata.phone || '';
      
      await poolInstance.execute(
        'INSERT INTO users (id, uid, name, email, password, role, status, created_at, createdAt, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, userId, name, email, password, role, status, createdAt, createdAt, phone]
      );
      
      const user = {
        id: userId,
        uid: userId,
        email,
        name,
        role,
        status,
        phone,
        createdAt
      };
      
      return {
        data: {
          user,
          session: {
            access_token: `mock_jwt_${userId}`,
            user
          }
        },
        error: null
      };
    }

    if (method === 'signInWithPassword') {
      const { email, password } = payload;
      
      const [users]: any[] = await poolInstance.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (!users || users.length === 0) {
        return { data: { user: null, session: null }, error: 'Invalid email or password' };
      }
      
      const user = users[0];
      if (user.password !== password) {
        return { data: { user: null, session: null }, error: 'Invalid email or password' };
      }
      
      const safeUser = {
        id: user.id,
        uid: user.uid || user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role || 'customer',
        status: user.status || 'Active',
        phone: user.phone || '',
        profileImage: user.profileImage || user.profile_image || ''
      };
      
      return {
        data: {
          user: safeUser,
          session: {
            access_token: `mock_jwt_${user.id}`,
            user: safeUser
          }
        },
        error: null
      };
    }
    
    // Helper to build WHERE clause
    const buildWhereClause = () => {
      if (filters.length === 0) return '';
      const parts = filters.map(f => {
        if (f.type === 'eq') {
          if (f.val === null) return `\`${f.col}\` IS NULL`;
          params.push(f.val);
          return `\`${f.col}\` = ?`;
        }
        if (f.type === 'neq') {
          if (f.val === null) return `\`${f.col}\` IS NOT NULL`;
          params.push(f.val);
          return `\`${f.col}\` != ?`;
        }
        if (f.type === 'like') {
          params.push(f.val);
          return `\`${f.col}\` LIKE ?`;
        }
        if (f.type === 'ilike') {
          params.push(f.val);
          return `LOWER(\`${f.col}\`) LIKE LOWER(?)`;
        }
        if (f.type === 'in') {
          if (!Array.isArray(f.val) || f.val.length === 0) return '1=0';
          f.val.forEach(v => params.push(v));
          return `\`${f.col}\` IN (${f.val.map(() => '?').join(', ')})`;
        }
        return '1=1';
      });
      return ` WHERE ${parts.join(' AND ')}`;
    };

    if (method === 'select') {
      sql = `SELECT * FROM \`${table}\``;
      sql += buildWhereClause();
      
      if (orderBy) {
        sql += ` ORDER BY \`${orderBy.col}\` ${orderBy.ascending ? 'ASC' : 'DESC'}`;
      }
      
      if (limitCount) {
        sql += ` LIMIT ${limitCount}`;
      } else if (isSingle) {
        sql += ` LIMIT 1`;
      }
      
      const [rows]: any[] = await poolInstance.execute(sql, params);
      
      // Parse JSON fields automatically if they are serialized
      const parsedRows = rows.map((row: any) => {
        const copy = { ...row };
        Object.keys(copy).forEach(key => {
          const val = copy[key];
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try {
              copy[key] = JSON.parse(val);
            } catch (e) {
              // Not actual JSON, leave as string
            }
          }
        });
        
        // Dynamic self-healing: Flatten parsed JSON from 'value' or 'settings_value' to top level
        if (copy.value && typeof copy.value === 'object' && !Array.isArray(copy.value)) {
          Object.assign(copy, copy.value);
        }
        if (copy.settings_value && typeof copy.settings_value === 'object' && !Array.isArray(copy.settings_value)) {
          Object.assign(copy, copy.settings_value);
        }
        
        return copy;
      });

      if (isSingle || isMaybeSingle) {
        return { data: parsedRows[0] || null, error: null, count: parsedRows.length };
      }
      return { data: parsedRows, error: null, count: parsedRows.length };
    }
    
    if (method === 'insert') {
      const recordsRaw = Array.isArray(payload) ? payload : [payload];
      if (recordsRaw.length === 0) {
        return { data: [], error: null, count: 0 };
      }
      
      const insertedRows: any[] = [];
      for (const rawRec of recordsRaw) {
        const record = await filterAndMapPayload(table, rawRec, poolInstance);
        const fields = Object.keys(record);
        if (fields.length === 0) continue;

        const recordValues = fields.map(f => {
          let val = record[f];
          if (val && (typeof val === 'object' || Array.isArray(val))) {
            return JSON.stringify(val);
          }
          if (typeof val === 'boolean') {
            return val ? 1 : 0;
          }
          return val;
        });
        
        const insertSql = "INSERT INTO `" + table + "` (`" + fields.join("`, `") + "`) VALUES (" + fields.map(() => '?').join(', ') + ")";
        const [result]: any = await poolInstance.execute(insertSql, recordValues);
        insertedRows.push({ ...rawRec, ...record, id: record.id || result.insertId });
      }
      
      return { data: Array.isArray(payload) ? insertedRows : insertedRows[0], error: null, count: insertedRows.length };
    }
    
    if (method === 'update') {
      const record = await filterAndMapPayload(table, payload, poolInstance);
      const fields = Object.keys(record);
      if (fields.length === 0) {
        return { data: null, error: null, count: 0 };
      }
      
      let updateSql = `UPDATE \`${table}\` SET `;
      const updateParts = fields.map(f => {
        let val = record[f];
        if (val && (typeof val === 'object' || Array.isArray(val))) {
          params.push(JSON.stringify(val));
        } else if (typeof val === 'boolean') {
          params.push(val ? 1 : 0);
        } else {
          params.push(val);
        }
        return `\`${f}\` = ?`;
      });
      updateSql += updateParts.join(', ');
      updateSql += buildWhereClause();
      
      const [result]: any = await poolInstance.execute(updateSql, params);
      return { data: { ...payload, ...record }, error: null, count: result.affectedRows };
    }
    
    if (method === 'delete') {
      sql = `DELETE FROM \`${table}\``;
      sql += buildWhereClause();
      
      const [result]: any = await poolInstance.execute(sql, params);
      return { data: null, error: null, count: result.affectedRows };
    }
    
    if (method === 'upsert') {
      const recordsRaw = Array.isArray(payload) ? payload : [payload];
      if (recordsRaw.length === 0) {
        return { data: [], error: null, count: 0 };
      }
      
      const upsertedRows: any[] = [];
      for (const rawRec of recordsRaw) {
        const record = await filterAndMapPayload(table, rawRec, poolInstance);
        const fields = Object.keys(record);
        if (fields.length === 0) continue;

        const recordValues = fields.map(f => {
          let val = record[f];
          if (val && (typeof val === 'object' || Array.isArray(val))) {
            return JSON.stringify(val);
          }
          if (typeof val === 'boolean') {
            return val ? 1 : 0;
          }
          return val;
        });
        
        // Build ON DUPLICATE KEY UPDATE clause
        const updateClause = fields
          .filter(f => f !== 'id')
          .map(f => "`" + f + "` = VALUES(\`" + f + "\`)")
          .join(', ');
          
        const upsertSql = "INSERT INTO `" + table + "` (`" + fields.join("`, `") + "`) VALUES (" + fields.map(() => '?').join(', ') + ") ON DUPLICATE KEY UPDATE " + (updateClause || "`id` = VALUES(`id`)");
          
        await poolInstance.execute(upsertSql, recordValues);
        upsertedRows.push({ ...rawRec, ...record });
      }
      
      return { data: Array.isArray(payload) ? upsertedRows : upsertedRows[0], error: null, count: upsertedRows.length };
    }
    
    throw new Error(`Unsupported method: ${method}`);
  } catch (err: any) {
    console.error('[executeProxyQuery Error]', err);
    return { data: null, error: err.message || 'Database error', count: 0 };
  }
}

class MockQueryBuilder {
  private tableName: string;
  private filters: any[] = [];
  private orderBy: any = null;
  private limitCount: number | null = null;
  private isSingle = false;

  constructor(tableName: string) {
    this.tableName = tableName;
    // Binding then to make it thenable
    this.then = this.then.bind(this);
  }

  select(cols: string = '*') {
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
    this.isSingle = true;
    return this;
  }

  async insert(payload: any) {
    const res = await executeProxyQuery({
      table: this.tableName,
      method: 'insert',
      payload
    });
    return res;
  }

  async update(payload: any) {
    const res = await executeProxyQuery({
      table: this.tableName,
      method: 'update',
      payload,
      filters: this.filters
    });
    return res;
  }

  async upsert(payload: any) {
    const res = await executeProxyQuery({
      table: this.tableName,
      method: 'upsert',
      payload
    });
    return res;
  }

  async delete() {
    const res = await executeProxyQuery({
      table: this.tableName,
      method: 'delete',
      filters: this.filters
    });
    return res;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    const promise = executeProxyQuery({
      table: this.tableName,
      method: 'select',
      filters: this.filters,
      orderBy: this.orderBy,
      limitCount: this.limitCount,
      isSingle: this.isSingle
    });
    return promise.then(onfulfilled, onrejected);
  }
}

