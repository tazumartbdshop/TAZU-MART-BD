import { Product } from '../store/useProductStore';

// Levenshtein distance formulation
export function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // deletion
          matrix[i][j - 1] + 1,    // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

// Check if a query word is a spelling-tolerant fuzzy match of any target word/keyword
export function isFuzzyMatch(queryWord: string, targetKey: string): boolean {
  const qLower = queryWord.toLowerCase().trim();
  const tLower = targetKey.toLowerCase().trim();
  
  if (qLower.length === 0 || tLower.length === 0) return false;
  
  // Exact match starts or incorporates
  if (tLower.includes(qLower) || qLower.includes(tLower)) return true;

  // Spell tolerance checks (levenshtein distance thresholds by length)
  const len = qLower.length;
  const dist = getLevenshteinDistance(qLower, tLower);

  if (len <= 3) {
    return dist <= 0; // Require exact match for small strings (3 or less)
  } else if (len <= 4) {
    return dist <= 1; // 1 typo allowed for 4 chars
  } else {
    return dist <= 2; // 2 typos/transpositions allowed for 5+ characters to catch "wathc" & "secent"
  }
}

// Bangla & phonetic misspellings mapping dictionary for semantic matching
const BILINGUAL_DICTIONARY: Record<string, string> = {
  // ঘড়ি mapping
  'ghori': 'watch clock wrist-watch ghori',
  'gorit': 'watch clock wrist-watch ghori',
  'ghory': 'watch clock wrist-watch ghori',
  'wathc': 'watch clock wrist-watch ghori',
  'wrist': 'watch clock wrist-watch ghori',
  'smartwatch': 'watch smart-watch',
  'smaert': 'watch smart-watch smart',
  'ঘড়ি': 'watch ghori wrist-watch clock',
  'হাত ঘড়ি': 'watch ghori wrist-watch clock',
  'হাতঘড়ি': 'watch ghori wrist-watch clock',

  // মোবাইল mapping
  'mobile': 'phone smartphone phone',
  'phone': 'phone mobile smartphone',
  'smartphone': 'phone mobile smartphone',
  'mobaile': 'phone mobile smartphone',
  'মোবাইল': 'phone mobile smartphone',

  // হেডফোন mapping
  'earbud': 'earbuds headphone earphone wireless',
  'earbuds': 'earbuds headphone earphone wireless',
  'headphone': 'earbuds headphone earphone wireless',
  'hedfon': 'earbuds headphone earphone wireless',
  'হেডফোন': 'earbuds headphone earphone wireless',
  'হেড ফোন': 'earbuds headphone earphone wireless',

  // সুগন্ধি mapping
  'perfume': 'perfume scent fragrance attar',
  'scent': 'perfume scent fragrance attar',
  'sent': 'perfume scent fragrance attar',
  'secent': 'perfume scent fragrance attar',
  'sugondho': 'perfume scent fragrance attar',
  'sugondhi': 'perfume scent fragrance attar',
  's सुगंध': 'perfume scent fragrance attar',
  'sugondha': 'perfume scent fragrance attar',
  'সুগন্ধি': 'perfume scent fragrance attar',
  'সুগন্ধী': 'perfume scent fragrance attar',

  // জুতা mapping
  'juta': 'shoes sneaker shoe',
  'juto': 'shoes sneaker shoe',
  'shoe': 'shoes sneaker shoe',
  'shoes': 'shoes sneaker shoe',
  'sneakers': 'shoes sneaker shoe',
  'sneaker': 'shoes sneaker shoe',
  'জুতা': 'shoes sneaker shoe',
  'জুতো': 'shoes sneaker shoe',

  // শার্ট mapping
  'shirt': 'shirt clothing shirts',
  'shert': 'shirt clothing shirts',
  'sart': 'shirt clothing shirts',
  'শার্ট': 'shirt clothing shirts',

  // প্যান্ট mapping
  'pant': 'pant trouser pants',
  'pants': 'pant trouser pants',
  'panti': 'pant trouser pants',
  'trouser': 'pant trouser pants',
  'প্যান্ট': 'pant trouser pants',

  // ওয়ালেট mapping
  'wallet': 'wallet leather money-bag moneybag valet',
  'walet': 'wallet leather money-bag moneybag valet',
  'valet': 'wallet leather money-bag moneybag valet',
  'moneybag': 'wallet leather money-bag moneybag valet',
  'ওয়ালেট': 'wallet leather money-bag moneybag valet'
};

// Extractor for intent and query rewriting (semantic matching)
export function extractIntentAndQuery(queryStr: string) {
  const norm = queryStr.toLowerCase().trim();
  let rewritten = norm;

  // 1. Check for word-by-word and substring-based translations so we expand both Bangla and misspelled equivalents
  Object.entries(BILINGUAL_DICTIONARY).forEach(([source, target]) => {
    if (norm.includes(source)) {
      rewritten = `${rewritten} ${target}`;
    }
  });

  // 2. Identify Intent Flags
  const isCheapIntent = norm.includes('সস্তা') || norm.includes('cheap') || norm.includes('low price');
  const isExpensiveIntent = norm.includes('দামি') || norm.includes('expensive') || norm.includes('high price') || norm.includes('premium');
  const isMenIntent = norm.includes('ছেলেদের') || norm.includes('men') || norm.includes('boy') || norm.includes('male') || norm.includes('boys');
  const isWomenIntent = norm.includes('মেয়েদের') || norm.includes('women') || norm.includes('girl') || norm.includes('female');
  const isHighRatedIntent = norm.includes('ভালো') || norm.includes('best') || norm.includes('good') || norm.includes('top rated') || norm.includes('rating');

  return { 
    rewrittenQuery: rewritten, 
    isCheapIntent, 
    isExpensiveIntent, 
    isMenIntent, 
    isWomenIntent, 
    isHighRatedIntent 
  };
}

// Full matching algorithms taking spelling tolerance for full records
export function filterProductsSmart(products: Product[], queryStr: string): Product[] {
  const cleanQuery = queryStr.trim().toLowerCase();
  if (!cleanQuery) return products;

  // Direct exact keyword checks for special groups
  if (cleanQuery === 'flash_sale' || cleanQuery === 'flash sale' || cleanQuery === 'flash') {
    return products.filter(p => p.is_flash_sale);
  }
  if (cleanQuery === 'trending' || cleanQuery === 'trending_item' || cleanQuery === 'trending item') {
    return products.filter(p => p.is_trending);
  }
  if (cleanQuery === 'best_selling' || cleanQuery === 'best selling' || cleanQuery === 'best' || cleanQuery === 'best seller') {
    return products.filter(p => p.is_best_selling);
  }
  if (cleanQuery === 'offer' || cleanQuery === 'offers' || cleanQuery === 'offer_product' || cleanQuery === 'offer product') {
    return products.filter(p => p.is_offer);
  }

  // Extract the intent
  const { 
    rewrittenQuery, 
    isCheapIntent, 
    isExpensiveIntent, 
    isMenIntent, 
    isWomenIntent, 
    isHighRatedIntent 
  } = extractIntentAndQuery(cleanQuery);

  const queryWords = rewrittenQuery.split(/\s+/).filter(w => w.length > 0);
  if (queryWords.length === 0) return products;

  // Filter products matching any query word elegantly
  const matched = products.filter(p => {
    const name = p.name.toLowerCase();
    const cat = p.category.toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const tags = (Array.isArray(p.seoPoints) ? p.seoPoints : []).map(t => t.toLowerCase());
    const kws = (Array.isArray(p.keywords) ? p.keywords : []).map(k => k.toLowerCase());

    // Matches SKU directly
    if (sku.includes(cleanQuery)) return true;

    // Direct subset matches on full queries
    if (name.includes(cleanQuery)) return true;
    if (cat.includes(cleanQuery)) return true;
    if (brand.includes(cleanQuery)) return true;
    
    // Fuzzy matching word-by-word
    return queryWords.some(qw => {
      // Check in product keywords
      if (kws.some(kw => isFuzzyMatch(qw, kw))) return true;
      if (tags.some(tag => isFuzzyMatch(qw, tag))) return true;

      // Check on words in Name, Category, Brand, Description
      const nameWords = name.split(/\s+/);
      const catWords = cat.split(/\s+/);
      const brandWords = brand.split(/\s+/);
      
      if (nameWords.some(nw => isFuzzyMatch(qw, nw))) return true;
      if (catWords.some(cw => isFuzzyMatch(qw, cw))) return true;
      if (brandWords.some(bw => isFuzzyMatch(qw, bw))) return true;
      
      return false;
    });
  });

  // Apply semantic intent triggers (Sorting / Prioritizing)
  return [...matched].sort((a, b) => {
    // 1. Sort by Gender Intent Priority
    if (isMenIntent) {
      const aIsMen = a.name.toLowerCase().includes('men') || (a.keywords || []).includes('men watch') || (a.keywords || []).includes('boys');
      const bIsMen = b.name.toLowerCase().includes('men') || (b.keywords || []).includes('men watch') || (b.keywords || []).includes('boys');
      if (aIsMen && !bIsMen) return -1;
      if (!aIsMen && bIsMen) return 1;
    }
    if (isWomenIntent) {
      const aIsWomen = a.name.toLowerCase().includes('women') || (a.keywords || []).includes('female') || (a.keywords || []).includes('girl');
      const bIsWomen = b.name.toLowerCase().includes('women') || (b.keywords || []).includes('female') || (b.keywords || []).includes('girl');
      if (aIsWomen && !bIsWomen) return -1;
      if (!aIsWomen && bIsWomen) return 1;
    }

    // 2. Sort by Rating Intent
    if (isHighRatedIntent) {
      return (b.rating || 5) - (a.rating || 5);
    }

    // 3. Sort by Price Intents
    const aPrice = a.discountPrice || a.price;
    const bPrice = b.discountPrice || b.price;
    if (isCheapIntent) {
      return aPrice - bPrice; // ascending
    }
    if (isExpensiveIntent) {
      return bPrice - aPrice; // descending
    }

    return 0; // maintain default search score ordering
  });
}
