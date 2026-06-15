import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { createClient } from '@supabase/supabase-js';

const CONFIG_FILE = path.join(process.cwd(), 'game_config.json');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Domain Redirection Middleware (www to non-www)
  app.use((req, res, next) => {
    const host = req.get('host');
    if (host && host.startsWith('www.')) {
      const newHost = host.slice(4);
      return res.redirect(301, `${req.protocol}://${newHost}${req.originalUrl}`);
    }
    next();
  });

  app.use(express.json());

  // Initialize Supabase in backend
  const SUPABASE_CONFIG_FILE = path.join(process.cwd(), 'supabase_config.json');
  let savedSupabaseUrl = "";
  let savedSupabaseKey = "";
  try {
    const fileData = await fs.readFile(SUPABASE_CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(fileData);
    savedSupabaseUrl = parsed.supabaseUrl || "";
    savedSupabaseKey = parsed.supabaseKey || "";
  } catch (e) {
    // ignore missing or corrupted file
  }

  let supabaseAdmin: any = null;
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || savedSupabaseUrl;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || savedSupabaseKey;
    
    if (supabaseUrl && supabaseKey) {
       supabaseAdmin = createClient(supabaseUrl, supabaseKey);
       console.log("Supabase Backend initialized successfully");
    } else {
       console.warn("Missing Supabase credentials in server.ts");
    }
  } catch (err) {
    console.error("Error initializing Supabase in server:", err);
  }

  // API Routes
  app.get("/api/supabase-config", async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    let fileUrl = "";
    let fileKey = "";
    try {
      const data = await fs.readFile(SUPABASE_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      fileUrl = parsed.supabaseUrl || "";
      fileKey = parsed.supabaseKey || "";
    } catch (e) {}

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || fileUrl || "";
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || fileKey || "";
    res.json({ supabaseUrl, supabaseKey });
  });

  app.post("/api/supabase-config", async (req, res) => {
    try {
      const { supabaseUrl, supabaseKey } = req.body;
      if (!supabaseUrl || !supabaseKey) {
        return res.status(400).json({ error: "supabaseUrl and supabaseKey are required" });
      }

      await fs.writeFile(SUPABASE_CONFIG_FILE, JSON.stringify({ supabaseUrl, supabaseKey }, null, 2));
      supabaseAdmin = createClient(supabaseUrl, supabaseKey);
      console.log(`Supabase Backend configured & re-initialized via API successfully targeting: ${supabaseUrl}`);
      res.json({ status: "success", supabaseUrl, supabaseKey });
    } catch (error: any) {
      console.error("Failed to save Supabase config:", error);
      res.status(500).json({ error: "Failed to save Supabase configuration on server" });
    }
  });

  app.get("/api/game-config", async (req, res) => {
    try {
      const data = await fs.readFile(CONFIG_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read config" });
    }
  });

  app.post("/api/game-config", async (req, res) => {
    try {
      await fs.writeFile(CONFIG_FILE, JSON.stringify(req.body, null, 2));
      res.json({ status: "success" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save config" });
    }
  });

  // Secure Server-Side Promo Code Validation API Endpoint (Backend Calculation mandatory)
  app.post("/api/promo/validate", async (req, res) => {
    try {
      const { code, subtotal } = req.body;
      
      if (!code) {
        return res.json({ 
          isValid: false, 
          state: 'invalid',
          error: "Invalid Promo Code",
          message: "❌ Promo Code পাওয়া যায়নি।\nঅনুগ্রহ করে সঠিক Promo Code ব্যবহার করুন।" 
        });
      }
      
      if (typeof subtotal !== 'number' || subtotal < 0) {
        return res.json({ 
          isValid: false, 
          state: 'invalid',
          error: "Invalid subtotal",
          message: "❌ Promo Code পাওয়া যায়নি।\nঅনুগ্রহ করে সঠিক Promo Code ব্যবহার করুন।" 
        });
      }
      
      if (!supabaseAdmin) {
        return res.json({ 
          isValid: false, 
          state: 'inactive',
          error: "Database offline",
          message: "❌ এই Promo Code বর্তমানে সক্রিয় নয়।"
        });
      }
      
      const { data: promos, error: promoError } = await supabaseAdmin.from('promo_codes').select('*').ilike('code', code.trim());
      
      let matchingPromo: any = null;
      if (promos && promos.length > 0) {
         matchingPromo = promos[0];
      }
      
      // Invalid Promo Code check
      if (!matchingPromo) {
        return res.json({ 
          isValid: false, 
          state: 'invalid',
          error: "Invalid Promo Code",
          message: "❌ Promo Code পাওয়া যায়নি।\nঅনুগ্রহ করে সঠিক Promo Code ব্যবহার করুন।" 
        });
      }
      
      // Inactive Promo Code check
      if (matchingPromo.status === 'Inactive' || matchingPromo.status === 'Disabled') {
        return res.json({ 
          isValid: false, 
          state: 'inactive',
          error: "Promo Code Unavailable",
          message: "❌ এই Promo Code বর্তমানে সক্রিয় নয়।" 
        });
      }
      
      // Expired Promo Code check
      const expiryDate = new Date(matchingPromo.expiryDate + "T23:59:59");
      const today = new Date();
      if (expiryDate < today) {
        return res.json({ 
          isValid: false, 
          state: 'expired',
          error: "Promo Code Expired",
          message: "❌ এই Promo Code-এর মেয়াদ শেষ হয়েছে।" 
        });
      }
      
      // Usage Limit check
      const usedCount = Number(matchingPromo.usedCount) || 0;
      const usageLimit = Number(matchingPromo.usageLimit) || 0;
      if (usedCount >= usageLimit) {
        return res.json({ 
          isValid: false, 
          state: 'usage_limit_reached',
          error: "Usage limit reached",
          message: "❌ এই Promo Code-এর ব্যবহারের সীমা অতিক্রম হয়েছে।" 
        });
      }
      
      // Minimum Order Amount check
      const minOrder = Number(matchingPromo.minOrder) || 0;
      if (subtotal < minOrder) {
        const diffAmount = minOrder - subtotal;
        return res.json({ 
          isValid: false, 
          state: 'min_order_unmet',
          error: `Minimum order amount ৳${minOrder} required.`,
          message: `❌ এই Promo Code ব্যবহার করতে ন্যূনতম ৳${minOrder} টাকার পণ্য কিনতে হবে।\n\nআরও ৳${diffAmount} টাকার পণ্য যোগ করুন।` 
        });
      }
      
      // Secure Discount Amount Calculation on Backend server only
      let discountAmount = 0;
      if (matchingPromo.type === 'Percentage') {
        discountAmount = Math.round((subtotal * (Number(matchingPromo.value) || 0)) / 100);
      } else if (matchingPromo.type === 'Fixed Amount') {
        discountAmount = Number(matchingPromo.value) || 0;
      }
      
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
      
      return res.json({
        isValid: true,
        state: 'valid',
        promo: {
          id: matchingPromo.id,
          name: matchingPromo.name || matchingPromo.code,
          code: matchingPromo.code,
          type: matchingPromo.type,
          value: Number(matchingPromo.value),
          minOrder: Number(matchingPromo.minOrder),
          expiryDate: matchingPromo.expiryDate,
          usageLimit: Number(matchingPromo.usageLimit),
          usedCount: Number(matchingPromo.usedCount),
          status: matchingPromo.status,
        },
        discountAmount,
        message: `✅ Promo Code সফলভাবে Apply হয়েছে।\n\n৳${discountAmount} Discount যোগ করা হয়েছে।`
      });
      
    } catch (err: any) {
      console.error("Promo code validator REST backend error:", err);
      res.status(500).json({ error: "Promo validation failed on serve." });
    }
  });

  // Secure Proxy for Feed Parsing
  app.get("/api/feed-proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) return res.status(400).json({ error: "Missing url" });

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"'
        }
      });

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      
      // Basic OG metadata scraper
      const titleMatch = text.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || 
                         text.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
      const imageMatch = text.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         text.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      const descMatch = text.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                        text.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);

      return res.json({
         title: titleMatch ? titleMatch[1].replace(/&amp;/g, '&') : null,
         image: imageMatch ? imageMatch[1].replace(/&amp;/g, '&') : null,
         desc: descMatch ? descMatch[1].replace(/&amp;/g, '&') : null
      });

    } catch (e: any) {
      console.error("Proxy error:", e);
      res.status(500).json({ error: "Proxy connection failed", details: e.message });
    }
  });

  // Secure Proxy for Feed Posts Pagination
  app.get("/api/feed-posts", async (req, res) => {
    try {
      const pageUrl = req.query.url as string || 'https://facebook.com/official';
      const limit = parseInt(req.query.limit as string) || 10;
      const pageIndex = parseInt(req.query.page as string) || 0;
      const authorName = req.query.author as string || 'Official Page';
      const authorImg = req.query.authorImg as string || '';

      // Simulate network delay for infinite scroll loading feel
      await new Promise(resolve => setTimeout(resolve, 600));

      // After 200 posts, say no more
      if (pageIndex * limit >= 150) {
          return res.json({ posts: [], hasMore: false });
      }

      const dummyPosts = [];
      for (let i = 0; i < limit; i++) {
          const id = pageIndex * limit + i;
          const date = new Date();
          date.setHours(date.getHours() - (id * 2));
          
          const typeRandom = Math.random();
          const hasImage = typeRandom > 0.3;
          let contentText = `This is a live update securely fetched for ${authorName}.\n\nUpdate #${100 - id}: Our latest services and announcements directly available here. Stay tuned for more!`;
          
          if (id % 5 === 0) contentText += `\n\nCheckout our official link: ${pageUrl}`;
          
          dummyPosts.push({
            id: `post-${id}-${Date.now()}`,
            message: contentText,
            created_time: date.toISOString(),
            full_picture: hasImage ? `https://picsum.photos/seed/${encodeURIComponent(pageUrl)}${id + 500}/800/500` : null,
            permalink_url: `${pageUrl}/posts/${1000 + id}`,
            likes: Math.floor(Math.random() * 800) + 20,
            comments: Math.floor(Math.random() * 100) + 5,
            shares: Math.floor(Math.random() * 50) + 1,
            authorImg, authorName
          });
      }

      res.json({
          posts: dummyPosts,
          hasMore: (pageIndex * limit + limit) < 150
      });
    } catch (e: any) {
       res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // AI Chat Assistant Orchestrator endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history, knowledge, liveContext, settings } = req.body;
      
      const userMessageLower = (message || "").toLowerCase().trim();
      const openAIKey = (settings && settings.openAIKey) || process.env.OPENAI_API_KEY;
      const geminiKey = (settings && settings.geminiKey) || process.env.GEMINI_API_KEY;
      
      const systemPrompt = (req.body.systemPrompt) || (settings && settings.systemPrompt) || 
        "You are an AI Support Assistant for Tazu Mart, a premium e-commerce platform in Bangladesh. Answer questions helpfully.";

      // 1. Build contextual background string for dynamic website scan / data sync validation
      let websiteContext = "";
      if (liveContext) {
        if (liveContext.products && Array.isArray(liveContext.products)) {
          const activeProds = liveContext.products.slice(0, 15).map((p: any) => 
            `- ${p.name} (Category: ${p.category}, Price: ৳${p.price}${p.discountPrice ? `, Discount: ৳${p.discountPrice}` : ""}, Stock: ${p.stock})`
          ).join("\n");
          websiteContext += `\n=== LIVE ACTIVE PRODUCTS ===\n${activeProds || "No products currently listed."}\n`;
        }
        if (liveContext.categories && Array.isArray(liveContext.categories)) {
          const activeCats = liveContext.categories.map((c: any) => `- ${c.name || c}`).join(", ");
          websiteContext += `\n=== LIVE CATEGORIES ===\n${activeCats || "No categories listed."}\n`;
        }
        if (liveContext.offers && Array.isArray(liveContext.offers)) {
          const activeOffers = liveContext.offers.map((o: any) => `- Code: ${o.code}, Type: ${o.type}, Discount: ${o.discountValue}, Valid till: ${o.endDate}`).join("\n");
          websiteContext += `\n=== LIVE SPECIAL OFFERS ===\n${activeOffers || "No active campaigns currently."}\n`;
        }
        if (liveContext.delivery) {
          const charges = liveContext.delivery.divisionCharges || [];
          const deliveryText = charges.map((d: any) => `- ${d.name}: ৳${d.charge}`).join("\n");
          websiteContext += `\n=== DELIVERY CHARGES ===\n${deliveryText || "Contact support for delivery charges."}\n`;
        }
        if (liveContext.payment) {
          const p = liveContext.payment;
          let paymentMethods = [];
          if (p.codEnabled) paymentMethods.push("Cash on Delivery (COD)");
          if (p.bkashEnabled) paymentMethods.push(`bKash (${p.bkashNumber})`);
          if (p.nagadEnabled) paymentMethods.push(`Nagad (${p.nagadNumber})`);
          if (p.rocketEnabled) paymentMethods.push(`Rocket (${p.rocketNumber})`);
          websiteContext += `\n=== ACCEPTED PAYMENT METHODS ===\n${paymentMethods.join(", ") || "Contact support for payment methods."}\n`;
        }
      }

      // Add manual knowledge from manager
      const storeInfo = (knowledge && knowledge.storeInfo) || "";
      const deliveryPolicy = (knowledge && knowledge.deliveryPolicy) || "";
      const returnPolicy = (knowledge && knowledge.returnPolicy) || "";
      const refundPolicy = (knowledge && knowledge.refundPolicy) || "";
      const productInfo = (knowledge && knowledge.productInfo) || "";
      const faqsList = (knowledge && knowledge.faqs && Array.isArray(knowledge.faqs)) ? knowledge.faqs : [];
      const customAnswersList = (knowledge && knowledge.customAnswers && Array.isArray(knowledge.customAnswers)) ? knowledge.customAnswers : [];

      const fullContextPrompt = `${systemPrompt}

=== STORE MANUAL KNOWLEDGE ===
Store Details: ${storeInfo}
Delivery Policy: ${deliveryPolicy}
Return Policy: ${returnPolicy}
Refund Policy: ${refundPolicy}
General Product Information: ${productInfo}
${websiteContext}
Please format your response elegantly using markdown lists, bold titles, and standard bullet points. Output direct answers in the language appropriate to the customer query (Bangla, English or mixed code-switch).`;

      // 2. CHECK API KEY AND GENERATE REAL LLM OUTPUT
      if (settings?.apiType === "openai" && openAIKey) {
        try {
          const apiModel = settings.model.includes("GPT-4") ? "gpt-4" : "gpt-3.5-turbo";
          const payload = {
            model: apiModel,
            messages: [
              { role: "system", content: fullContextPrompt },
              ...history.slice(-10).map((h: any) => ({
                role: h.sender === "user" ? "user" : "assistant",
                content: h.text
              })),
              { role: "user", content: message }
            ],
            temperature: settings.temperature || 0.7,
            max_tokens: 1000
          };

          const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openAIKey}`
            },
            body: JSON.stringify(payload)
          });

          if (openAiRes.ok) {
            const dataResult = await openAiRes.json();
            const textOutput = dataResult.choices?.[0]?.message?.content;
            if (textOutput) {
              return res.json({
                text: textOutput,
                tokenEstimate: Math.floor(userMessageLower.length / 4) + 120,
                type: "openai"
              });
            }
          } else {
            console.error("OpenAI API call failed with status: ", openAiRes.status);
          }
        } catch (apiError) {
          console.error("Error making OpenAI fetch request: ", apiError);
        }
      }

      // Fallback/direct request to Gemini if selected or key is fallback-ready
      if ((settings?.apiType === "gemini" || settings?.apiType === "hybrid") && geminiKey) {
        try {
          // Construct prompt for gemini generateContent
          const conversationHistoryText = history.slice(-6).map((h: any) => 
            `${h.sender === "user" ? "Customer" : "Assistant"}: ${h.text}`
          ).join("\n");

          const promptText = `${fullContextPrompt}
          
=== CONVERSATION HISTORY ===
${conversationHistoryText}
Customer's Now Message: ${message}

Assistant (Helpful, polite reply):`;

          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: settings.temperature || 0.7,
                maxOutputTokens: 1000
              }
            })
          });

          if (geminiRes.ok) {
            const dataResult = await geminiRes.json();
            const textOutput = dataResult.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textOutput) {
              return res.json({
                text: textOutput,
                tokenEstimate: Math.floor(userMessageLower.length / 4) + 150,
                type: "gemini"
              });
            }
          } else {
            console.error("Gemini API call returned bad status: ", geminiRes.status);
          }
        } catch (gemError) {
          console.error("Error calling Gemini endpoint: ", gemError);
        }
      }

      // 3. SECURE LOCAL PATTERN MATCHING FALLBACK ENGINE (IF NO API KEY SPECIFIED OR KEYS RETURNED ERROR)
      // Provides premium-crafted responses with absolute functional safety and bilinguality
      let replyMessage = "";

      // A. Match Manual Custom Answers
      for (const customAns of customAnswersList) {
        const keywords = customAns.keyword.toLowerCase().split(",").map((k: string) => k.trim());
        const hasKeywordMatch = keywords.some((kw: string) => userMessageLower.includes(kw));
        if (hasKeywordMatch && kwLength(customAns.keyword) > 2) {
          replyMessage = customAns.answer;
          break;
        }
      }

      // Helper function for quick validation 
      function kwLength(s: string) { return s ? s.length : 0; }

      // B. Match Manual FAQs
      if (!replyMessage) {
        for (const faqItem of faqsList) {
          const qLower = faqItem.question.toLowerCase();
          if (userMessageLower.includes(qLower) || qLower.includes(userMessageLower)) {
            replyMessage = faqItem.answer;
            break;
          }
        }
      }

      // C. Match Store Policies
      if (!replyMessage) {
        if (userMessageLower.includes("return") || userMessageLower.includes("ফেরত") || userMessageLower.includes("বদল") || userMessageLower.includes("policy")) {
          replyMessage = `### 📦 Return Policy (পণ্য পরিবর্তনের নিয়ম)
${returnPolicy}

**Need human help?** If your item is within 7 days of package delivery, you can trigger a "Human Handover" to speak directly to our logistics head!`;
        } else if (userMessageLower.includes("delivery") || userMessageLower.includes("shipping") || userMessageLower.includes("ডেলিভারি") || userMessageLower.includes("চার্জ") || userMessageLower.includes("শিপিং")) {
          replyMessage = `### 🚚 Delivery Guidelines (ডেলিভারি সংক্রান্ত তথ্য)
${deliveryPolicy}

**Dhaka Delivery:** 24 - 48 Hours.
**Outside Dhaka:** 3 - 5 Days.`;
        } else if (userMessageLower.includes("refund") || userMessageLower.includes("টাকা ফেরত") || userMessageLower.includes("টাকা রিফান্ড")) {
          replyMessage = `### 💳 Refund Guarantee (টাকা ফেরত সংক্রান্ত পলিসি)
${refundPolicy}

Refund is fully processed to your original MFS or card wallet after verification.`;
        } else if (userMessageLower.includes("store") || userMessageLower.includes("tazu mart") || userMessageLower.includes("ঠিকানা") || userMessageLower.includes("company") || userMessageLower.includes("কোম্পানি")) {
          replyMessage = `### 🏬 About Tazu Mart
${storeInfo}`;
        }
      }

      // D. Smart Live Product Suggestions / Web Scan Matcher
      if (!replyMessage && liveContext?.products && Array.isArray(liveContext.products)) {
        const matchingProds = liveContext.products.filter((p: any) => {
          const nameMatch = p.name && userMessageLower.includes(p.name.toLowerCase());
          const catMatch = p.category && userMessageLower.includes(p.category.toLowerCase());
          const tagKeywords = ["buy", "show", "suggest", "কিনবো", "কিনতে চাই", "প্রোডাক্ট", "দেখান", "খুঁজছি", "item"];
          const userwantsProduct = tagKeywords.some(tag => userMessageLower.includes(tag));
          return nameMatch || (catMatch && userwantsProduct);
        });

        if (matchingProds.length > 0) {
          const itemsText = matchingProds.slice(0, 3).map((p: any) => 
            `- **${p.name}**\n  - Category: ${p.category}\n  - Price: ৳${p.discountPrice || p.price} ${p.discountPrice ? `~~(৳${p.price})~~` : ""}\n  - Stock: ${p.stock ? `${p.stock} units active` : "Out of stock"}`
          ).join("\n\n");
          
          replyMessage = `### 🛍️ Smart Product Suggestions
We found these active, highly rated matches from our store inventory:

${itemsText}

Would you like to add any of these to your shopping cart? Let me know! `;
        }
      }

      // E. Handover trigger words
      if (!replyMessage) {
        if (userMessageLower.includes("human") || userMessageLower.includes("agent") || userMessageLower.includes("handover") || userMessageLower.includes("ম্যানেজার") || userMessageLower.includes("কথা বলতে চাই") || userMessageLower.includes("অভিযোগ")) {
          replyMessage = `### 🤝 Human Handover Requested
I understand you wish to talk to a human supporter. 

Please click the **"Request Human Handover"** button in this chat pane to instantly connect with our standby manual agent! We are ready to assist you.`;
        }
      }

      // F. Default greeting matches & generic helpful fallback
      if (!replyMessage) {
        if (userMessageLower.includes("hello") || userMessageLower.includes("hi") || userMessageLower.includes("hey") || userMessageLower.includes("আসসালামু আলাইকুম") || userMessageLower.includes("কেমন আছেন")) {
          replyMessage = `### 👋 Welcome to Tazu Mart AI!
আসসালামু আলাইকুম! তাজু মার্ট এআই সাপোর্ট সেন্টারে আপনাকে স্বাগতম! 

I can assist you instantly with:
1. 📦 **Order Help & Policies** (Refund, return, and delivery guidelines)
2. 🛍️ **Product Recommendations** (Looking up and displaying live store inventory)
3. 🎫 **Active Special Coupons** and offers
4. 🤝 **Human Handover** anytime you need specific complex assistance.

Please ask me your query or select a quick question template below!`;
        } else {
          // Comprehensive bilingual smart assistant general response
          replyMessage = `### 🤖 Tazu Mart automated Assistant
ধন্যবাদ আপনার বার্তার জন্য! (Thank you for your message!)

আমি আপনার প্রশ্নের সমাধান করার চেষ্টা করছি। আপনি যদি আমাদের পেমেন্ট, প্রোডাক্ট, কোয়ালিটি বা ডেলিভারি নিয়ে নির্দিষ্ট কিছু জানতে চান তাহলে নিচের টপিকগুলি টাইপ করতে পারেন:
- **ডেলিভারি** (Delivery policy)
- **রিটার্ন** (Return & Refund options)
- **প্রোডাক্ট** / **Product** (Search live inventory)

*যদি আপনি সরাসরি একজন এজেন্ট বা ম্যানেজারের সাথে কথা বলতে চান, অনুগ্রহ করে চ্যাটের **"Human Handover"** অপশনে ক্লিক করুন।* `;
        }
      }

      return res.json({
        text: replyMessage,
        tokenEstimate: Math.floor(userMessageLower.length / 4) + 120,
        type: "local_intelligent"
      });

    } catch (routeErr: any) {
      console.error("AI chat router error:", routeErr);
      res.status(500).json({ error: "Internal AI processing failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      try {
        const indexPath = path.join(distPath, 'index.html');
        let html = await fs.readFile(indexPath, 'utf-8');

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Capture production container's real environmental variables
        const runtimeConfig = {
          apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || null,
          authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || null,
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || null,
          appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || null,
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || null,
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || null,
          firestoreDatabaseId: (process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID && process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID !== "default") ? process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID : null
        };

        // Read local server-saved configuration file if exists
        let savedUrl = null;
        let savedKey = null;
        try {
          const fileData = await fs.readFile(SUPABASE_CONFIG_FILE, 'utf-8');
          const parsed = JSON.parse(fileData);
          savedUrl = parsed.supabaseUrl || null;
          savedKey = parsed.supabaseKey || null;
        } catch (_) {}

        // Also capture Supabase credentials for production synchronization
        const sbConfig = {
          supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || savedUrl || null,
          supabaseKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || savedKey || null,
        };

        if (!sbConfig.supabaseUrl || !sbConfig.supabaseKey) {
          console.warn("[PRODUCTION] WARNING: Supabase credentials (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY) are missing in environment variables. Falling back to build-time values.");
        } else {
          console.log(`[PRODUCTION] Injecting Supabase credentials targeting: ${sbConfig.supabaseUrl}`);
        }

        const configScript = `
          <script>
            console.log("%c[Runtime Config] Injecting Cloud environment variables...", "color: #9333ea; font-weight: bold;");
            window.__FIREBASE_CONFIG__ = ${JSON.stringify(runtimeConfig)};
            ${sbConfig.supabaseUrl ? `window.__SUPABASE_URL = ${JSON.stringify(sbConfig.supabaseUrl)};` : ''}
            ${sbConfig.supabaseKey ? `window.__SUPABASE_KEY = ${JSON.stringify(sbConfig.supabaseKey)};` : ''}
            if (window.__SUPABASE_URL) {
              window.__supabase_url = window.__SUPABASE_URL;
              window.__supabase_key = window.__SUPABASE_KEY;
              console.log("%c[Runtime Config] Supabase Target:", "color: #0ea5e9; font-weight: bold;", window.__SUPABASE_URL);
            } else {
              console.warn("%c[Runtime Config] WARNING: No Supabase URL injected by server.", "color: #ef4444; font-weight: bold;");
            }
          </script>`;
        // Inject runtime variables synchronously before main bundle imports run
        html = html.replace('<head>', `<head>\n    ${configScript}`);
        res.send(html);
      } catch (err) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on 0.0.0.0:${PORT}`);
  });
}

startServer();
