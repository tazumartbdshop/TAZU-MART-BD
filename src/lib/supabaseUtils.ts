
/**
 * Utility to convert camelCase keys to snake_case for Supabase/Postgres
 */
export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Utility to convert snake_case keys to camelCase for Frontend
 */
export const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/g, group =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

/**
 * Transform object keys to snake_case recursively
 */
export const objectToSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => objectToSnake(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toSnakeCase(key)]: objectToSnake(obj[key]),
      }),
      {}
    );
  }
  return obj;
};

/**
 * Transform object keys to camelCase recursively
 */
export const objectToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => objectToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toCamelCase(key)]: objectToCamel(obj[key]),
      }),
      {}
    );
  }
  return obj;
};
