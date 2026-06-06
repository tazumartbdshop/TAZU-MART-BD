import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const CONFIG_FILE = path.join(process.cwd(), 'game_config.json');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Firebase in backend
  const CONFIG_APPLET_FILE = path.join(process.cwd(), 'firebase-applet-config.json');
  let db: any = null;
  try {
    const configText = await fs.readFile(CONFIG_APPLET_FILE, 'utf-8');
    const firebaseConfig = JSON.parse(configText);
    const firebaseApp = initializeApp(firebaseConfig);
    db = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
      : getFirestore(firebaseApp);
    console.log("Firebase Backend initialized successfully with database:", firebaseConfig.firestoreDatabaseId || "default");
  } catch (fbError) {
    console.error("Error initializing Firebase App in server:", fbError);
  }

  // API Routes
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
      
      if (!db) {
        return res.json({ 
          isValid: false, 
          state: 'inactive',
          error: "Database offline",
          message: "❌ এই Promo Code বর্তমানে সক্রিয় নয়।"
        });
      }
      
      const promoCodesCol = collection(db, "promo_codes");
      const qSnapshot = await getDocs(promoCodesCol);
      
      let matchingPromo: any = null;
      qSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.code && data.code.toUpperCase().trim() === code.toUpperCase().trim()) {
          matchingPromo = { id: docSnap.id, ...data };
        }
      });
      
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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
