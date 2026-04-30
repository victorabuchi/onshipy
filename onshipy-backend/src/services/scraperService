const axios = require('axios');
const cheerio = require('cheerio');

// Try to load axios-retry safely
try {
  const axiosRetry = require('axios-retry').default || require('axios-retry');
  axiosRetry(axios, {
    retries: 3,
    retryDelay: (count) => count * 1500,
    retryCondition: (err) => {
      const status = err.response?.status;
      return [429, 500, 502, 503, 504].includes(status) ||
        err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT';
    }
  });
} catch {}

// ─── User-agent rotation ──────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
];
const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const BASE_HEADERS = () => ({
  'User-Agent': randomUA(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
});

// ─── Puppeteer fallback ───────────────────────────────────────────────────────
let puppeteerAvailable = true;

const fetchWithPuppeteer = async (url) => {
  if (!puppeteerAvailable) throw new Error('Puppeteer not available');
  try {
    let chromium, puppeteer;
    try {
      chromium = require('@sparticuz/chromium');
      puppeteer = require('puppeteer-core');
    } catch {
      puppeteerAvailable = false;
      throw new Error('Puppeteer not installed');
    }

    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setUserAgent(randomUA());
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });

    // Wait for price or product container
    await Promise.race([
      page.waitForSelector('[itemprop="price"]', { timeout: 6000 }),
      page.waitForSelector('.price', { timeout: 6000 }),
      page.waitForSelector('[class*="product"]', { timeout: 6000 }),
    ]).catch(() => {});

    const html = await page.content();
    await browser.close();
    return html;
  } catch (err) {
    throw new Error('Puppeteer fetch failed: ' + err.message);
  }
};

// ─── Currency detection ───────────────────────────────────────────────────────
const detectCurrency = (domain, $, bodyText) => {
  const tld = domain.split('.').pop().toLowerCase();
  const tldMap = {
    de: 'EUR', fr: 'EUR', it: 'EUR', es: 'EUR', nl: 'EUR',
    fi: 'EUR', be: 'EUR', at: 'EUR', pt: 'EUR', gr: 'EUR',
    uk: 'GBP', au: 'AUD', ca: 'CAD', jp: 'JPY', se: 'SEK',
    dk: 'DKK', no: 'NOK', ch: 'CHF', in: 'INR', br: 'BRL',
    mx: 'MXN', sg: 'SGD', nz: 'NZD', za: 'ZAR', ng: 'NGN',
    gh: 'GHS', ke: 'KES', ae: 'AED'
  };

  const metaCurrency =
    $('meta[property="product:price:currency"]').attr('content') ||
    $('meta[property="og:price:currency"]').attr('content') ||
    $('meta[itemprop="priceCurrency"]').attr('content');
  if (metaCurrency) return metaCurrency.toUpperCase();

  let ldCurrency = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const d = JSON.parse($(el).html());
      const data = Array.isArray(d) ? d[0] : d;
      if (data['@type'] === 'Product') {
        const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
        if (offer?.priceCurrency) ldCurrency = offer.priceCurrency.toUpperCase();
      }
    } catch {}
  });
  if (ldCurrency) return ldCurrency;

  const symbolMap = [
    { sym: '€', cur: 'EUR' }, { sym: '£', cur: 'GBP' },
    { sym: '¥', cur: 'JPY' }, { sym: 'A$', cur: 'AUD' },
    { sym: 'C$', cur: 'CAD' }, { sym: 'kr', cur: 'SEK' },
    { sym: 'Fr', cur: 'CHF' }, { sym: '₹', cur: 'INR' },
    { sym: 'R$', cur: 'BRL' }, { sym: 'S$', cur: 'SGD' },
    { sym: '₦', cur: 'NGN' }, { sym: 'AED', cur: 'AED' },
  ];
  for (const { sym, cur } of symbolMap) {
    if (bodyText.includes(sym)) return cur;
  }

  if (domain.includes('.co.uk')) return 'GBP';
  if (domain.includes('.com.au')) return 'AUD';
  if (domain.includes('.co.jp')) return 'JPY';
  return tldMap[tld] || 'USD';
};

// ─── Price parser (FIXED for EU comma-decimal) ────────────────────────────────
const parsePrice = (raw) => {
  if (!raw) return null;
  const str = String(raw).trim();

  // Remove currency symbols and spaces but keep digits, commas, dots
  const cleaned = str.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return null;

  // EU format: 79,99 or 1.299,99
  if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }

  // US/UK format: 79.99 or 1,299.99
  if (/^\d{1,3}(,\d{3})*\.\d{2}$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/,/g, ''));
  }

  // Single comma as decimal: 79,99 (short form)
  if (/^\d+,\d{2}$/.test(cleaned)) {
    return parseFloat(cleaned.replace(',', '.'));
  }

  // Plain number
  const n = parseFloat(cleaned.replace(',', '.'));
  if (isNaN(n) || n <= 0) return null;

  // If > 10000 and no decimal, likely stored in cents
  if (n > 10000 && !cleaned.includes('.') && !cleaned.includes(',')) return n / 100;

  return n;
};

// ─── Image helpers ────────────────────────────────────────────────────────────
const isJunkImage = (src) => {
  if (!src) return true;
  return /icon|logo|sprite|pixel|tracking|badge|flag|star|avatar|placeholder|spinner|loading|blank|spacer|banner|ad[-_]|[-_]ad\.|social|share|cart|wishlist|compare|zoom-icon|svg\+xml|1x1|\.gif\?/i.test(src);
};

const upgradeImageUrl = (src) => {
  if (!src) return null;
  src = src.trim();
  if (src.startsWith('//')) src = 'https:' + src;
  if (!src.startsWith('http')) return null;

  // Nike CDN — swap small sizes for large
  if (src.includes('nike.com') || src.includes('nikecdn.com')) {
    src = src.replace(/[?&](cb|cr|wid|hei|qlt|fmt|fit|op_usm|resize)[^&]*/g, '');
    src = src.replace(/\?$/, '');
  }

  // Shopify size suffixes in filename
  src = src.replace(/_(pico|icon|thumb|small|compact|medium|large|grande|1024x1024|800x800|600x600|480x480|240x240)(\.|_)/i, '_2048x2048$2');

  // Generic WxH in filename like -800x800.jpg
  src = src.replace(/-\d{2,4}x\d{2,4}(\.(jpg|jpeg|png|webp))/i, '$1');

  // Cloudinary
  if (src.includes('cloudinary.com')) {
    src = src.replace(/\/upload\/[a-z_,0-9]+\//, '/upload/w_2048,q_auto,f_auto/');
  }

  return src;
};

const scoreImage = (src, title = '') => {
  if (!src || isJunkImage(src)) return -1;
  let score = 0;
  const lower = src.toLowerCase();
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (/product|item|goods|pdp|main|hero|primary|featured/i.test(lower)) score += 30;
  if (/gallery|carousel|slide|zoom/i.test(lower)) score += 20;
  if (titleWords.some(w => lower.includes(w))) score += 25;
  if (/2048|1920|1600|1200|large|full|original/i.test(lower)) score += 15;
  if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(lower)) score += 10;
  if (/thumb|small|tiny|mini|preview|60x|80x|100x|120x|150x/i.test(lower)) score -= 20;
  return score;
};

// ─── Nike-specific extractor ──────────────────────────────────────────────────
const extractNike = ($, product) => {
  // Nike stores all data in __NEXT_DATA__
  let nextData = null;
  $('script#__NEXT_DATA__').each((_, el) => {
    try { nextData = JSON.parse($(el).html()); } catch {}
  });

  if (!nextData) {
    $('script:not([src])').each((_, el) => {
      const text = $(el).html() || '';
      const m = text.match(/__NEXT_DATA__\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/);
      if (!m) return;
      try { nextData = JSON.parse(m[1]); } catch {}
    });
  }

  if (!nextData) return false;

  // Nike's data can live in multiple places depending on locale
  const state = nextData?.props?.pageProps?.initialState ||
                nextData?.props?.pageProps?.reduxState;

  const detail =
    state?.Wall?.productDetail?.threads?.[0]?.cards?.[0]?.sections?.[0]?.componentList?.[0]?.properties?.products?.[0] ||
    state?.ProductWall?.productDetail?.threads?.[0]?.cards?.[0]?.sections?.[0]?.componentList?.[0]?.properties?.products?.[0] ||
    state?.Checkout?.product ||
    nextData?.props?.pageProps?.product;

  // Try to find threads/products in state
  let nikeProduct = null;
  if (state) {
    // Walk state looking for a product with a price
    const findProduct = (obj, depth = 0) => {
      if (depth > 8 || typeof obj !== 'object' || !obj) return null;
      if (obj.fullPrice || obj.currentPrice || (obj.title && obj.colorCode)) return obj;
      for (const val of Object.values(obj)) {
        const found = findProduct(val, depth + 1);
        if (found) return found;
      }
      return null;
    };
    nikeProduct = detail || findProduct(state);
  }

  if (nikeProduct) {
    if (nikeProduct.title && !product.title) product.title = nikeProduct.title;
    if (nikeProduct.subtitle && !product.title) product.title = nikeProduct.subtitle;

    const price = nikeProduct.currentPrice || nikeProduct.fullPrice ||
                  nikeProduct.price?.currentPrice || nikeProduct.price?.fullPrice;
    if (price && !product.source_price) product.source_price = parsePrice(String(price));

    // Images from Nike threads
    const imgs = nikeProduct.images || nikeProduct.colorwayImages;
    if (Array.isArray(imgs)) {
      for (const img of imgs) {
        const src = typeof img === 'string' ? img :
          (img.squarishURL || img.portraitURL || img.landscapeURL || img.src || img.url);
        if (src) product.images.push(src);
      }
    }

    // Sizes
    const skus = nikeProduct.availableSkus || nikeProduct.skus || [];
    for (const sku of skus) {
      if (sku.localizedSize || sku.nikeSize) {
        const size = sku.localizedSize || sku.nikeSize;
        if (!/IO\d{4}/i.test(size)) { // skip SKU codes
          product.variants.push({ option: 'Size', value: size });
        }
      }
    }
  }

  // Fallback: scrape price from page text using Nike's specific format
  if (!product.source_price) {
    const priceEl = $('[data-testid="product-price"], .product-price, [class*="headline"]').first().text();
    const priceMatch = (priceEl || $('body').text()).match(/(\d[\d.,]+)\s*€|€\s*(\d[\d.,]+)/);
    if (priceMatch) {
      product.source_price = parsePrice(priceMatch[1] || priceMatch[2]);
    }
  }

  return !!nextData;
};

// ─── Variant extractor ────────────────────────────────────────────────────────
const extractVariants = ($, product) => {
  const variants = [];
  const seen = new Set();

  const addVariant = (option, value) => {
    if (!option || !value) return;
    option = option.trim().replace(/[_:-]/g, ' ').replace(/\s+/g, ' ');
    value = value.trim();
    if (!option || !value) return;
    if (/select|choose|available/i.test(value)) return;
    if (/^IO\d{4}/i.test(value)) return; // skip Nike SKU codes
    option = option.charAt(0).toUpperCase() + option.slice(1).toLowerCase();
    const key = `${option}::${value.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    variants.push({ option, value });
  };

  // Already extracted by Nike extractor
  if (product.variants.length > 0) return product.variants;

  // ── 1. JSON-LD ────────────────────────────────────────────────────────────
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const d = JSON.parse($(el).html());
      const items = Array.isArray(d) ? d : [d];
      for (const data of items) {
        if (data['@type'] !== 'Product') continue;
        const offers = Array.isArray(data.offers) ? data.offers : [data.offers];
        for (const offer of offers) {
          if (!offer) continue;
          if (offer.color) addVariant('Color', offer.color);
          if (offer.size) addVariant('Size', offer.size);
          if (offer.itemOffered?.color) addVariant('Color', offer.itemOffered.color);
          if (offer.itemOffered?.size) addVariant('Size', offer.itemOffered.size);
        }
        if (data.color) addVariant('Color', data.color);
        if (data.size) addVariant('Size', data.size);
      }
    } catch {}
  });

  // ── 2. Script blobs ───────────────────────────────────────────────────────
  $('script:not([src])').each((_, el) => {
    const text = $(el).html() || '';

    // __NEXT_DATA__ options/variants
    const nextMatch = text.match(/"options"\s*:\s*(\[[\s\S]*?\])/);
    if (nextMatch) {
      try {
        const opts = JSON.parse(nextMatch[1]);
        for (const opt of opts) {
          if (!opt.name) continue;
          for (const val of (opt.values || [])) {
            addVariant(opt.name, typeof val === 'string' ? val : val.value || val.label);
          }
        }
      } catch {}
    }

    // Shopify meta
    const metaMatch = text.match(/ShopifyAnalytics\.meta\s*=\s*(\{[\s\S]*?\});/) ||
                      text.match(/var\s+meta\s*=\s*(\{[\s\S]*?\});/);
    if (metaMatch) {
      try {
        const meta = JSON.parse(metaMatch[1]);
        const svariants = meta?.product?.variants || [];
        for (const v of svariants) {
          if (v.option1) addVariant(meta?.product?.options?.[0] || 'Option', v.option1);
          if (v.option2) addVariant(meta?.product?.options?.[1] || 'Option', v.option2);
          if (v.option3) addVariant(meta?.product?.options?.[2] || 'Option', v.option3);
        }
      } catch {}
    }

    // Shopify product blob
    const prodMatch = text.match(/var\s+product\s*=\s*(\{[\s\S]*?"variants"[\s\S]*?\});/);
    if (prodMatch) {
      try {
        const p = JSON.parse(prodMatch[1]);
        const opts = p.options || [];
        for (const v of (p.variants || [])) {
          if (v.option1 && opts[0]) addVariant(opts[0], v.option1);
          if (v.option2 && opts[1]) addVariant(opts[1], v.option2);
          if (v.option3 && opts[2]) addVariant(opts[2], v.option3);
        }
      } catch {}
    }

    // WooCommerce
    const wooMatch = text.match(/"variations"\s*:\s*(\[[\s\S]*?\])/);
    if (wooMatch) {
      try {
        const wooVars = JSON.parse(wooMatch[1]);
        for (const v of wooVars) {
          for (const [attr, val] of Object.entries(v.attributes || {})) {
            const name = attr.replace('attribute_pa_', '').replace('attribute_', '').replace(/-/g, ' ');
            if (val) addVariant(name, val);
          }
        }
      } catch {}
    }
  });

  // ── 3. HTML selects ───────────────────────────────────────────────────────
  $('select').each((_, el) => {
    const $sel = $(el);
    const label =
      $sel.attr('data-option') ||
      $sel.attr('aria-label') ||
      $sel.attr('name') ||
      $(`label[for="${$sel.attr('id')}"]`).text().trim() ||
      $sel.closest('[class*="variant"], [class*="option"], [class*="swatch"]').find('label').first().text().trim();

    if (!label) return;
    const optionName = label.replace(/[_-]/g, ' ').trim();
    if (!optionName || /quantity|qty|amount/i.test(optionName)) return;

    $sel.find('option').each((_, opt) => {
      const val = $(opt).val() || $(opt).text().trim();
      if (val && val !== '' && !/select|choose|pick/i.test(val)) {
        addVariant(optionName, val);
      }
    });
  });

  // ── 4. Swatch buttons ─────────────────────────────────────────────────────
  const swatchSelectors = [
    '[class*="swatch"] [data-value]',
    '[class*="variant"] button[data-value]',
    '[class*="option"] button[value]',
    '[class*="color"] button[data-value]',
    '[class*="size"] button[data-value]',
    '[data-option-value]',
    'button[data-swatch]',
    'li[data-value]',
    '[class*="color-swatch"]',
    '[class*="size-selector"] li',
    '[aria-label][class*="swatch"]',
    // Nike-specific
    '[data-test="size-option"]',
    '[data-test="color-option"]',
    '[class*="colorway"] button',
    '[class*="size-grid"] button',
  ];

  for (const sel of swatchSelectors) {
    $(sel).each((_, el) => {
      const $el = $(el);
      const val =
        $el.attr('data-value') ||
        $el.attr('value') ||
        $el.attr('data-option-value') ||
        $el.attr('data-size') ||
        $el.attr('aria-label') ||
        $el.text().trim();

      if (!val || /select|choose|IO\d{4}/i.test(val)) return;

      const classes = ($el.attr('class') || '') + ($el.closest('[class]').attr('class') || '');
      const container = $el.closest('[data-option-name], [data-name], [class*="swatch"], [class*="variant"], [class*="option"], [class*="color"], [class*="size"]');
      const label =
        container.attr('data-option-name') ||
        container.attr('data-name') ||
        container.find('> label, > legend, > h3, > h4, > [class*="label"], > [class*="title"]').first().text().trim() ||
        container.prev('label, [class*="label"]').text().trim();

      if (label) {
        addVariant(label, val);
      } else if (/color|colour/i.test(classes)) {
        addVariant('Color', val);
      } else if (/size/i.test(classes)) {
        addVariant('Size', val);
      }
    });
  }

  // ── 5. Radio buttons ─────────────────────────────────────────────────────
  $('input[type="radio"]').each((_, el) => {
    const $el = $(el);
    const name = $el.attr('name') || '';
    if (/quantity|qty/i.test(name)) return;
    const val = $el.val() || $el.attr('data-value');
    if (!val || /IO\d{4}/i.test(val)) return;
    const label =
      $(`label[for="${$el.attr('id')}"]`).text().trim() ||
      $el.closest('label').text().trim() ||
      name.replace(/[_-]/g, ' ');
    if (label) addVariant(label, val);
  });

  // ── 6. Amazon specific ────────────────────────────────────────────────────
  if (product.source_domain?.includes('amazon')) {
    $('#variation_color_name .selection, #variation_size_name .selection').each((_, el) => {
      const text = $(el).text().trim();
      const isColor = $(el).closest('#variation_color_name').length > 0;
      if (text) addVariant(isColor ? 'Color' : 'Size', text);
    });
  }

  return variants;
};

// ─── Platform-specific extractors ────────────────────────────────────────────
const extractShopify = ($, product) => {
  $('script:not([src])').each((_, el) => {
    const text = $(el).html() || '';
    const match = text.match(/var\s+meta\s*=\s*(\{[\s\S]*?\});/) ||
                  text.match(/ShopifyAnalytics\.meta\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
      try {
        const meta = JSON.parse(match[1]);
        if (meta?.product) {
          const p = meta.product;
          if (p.title && !product.title) product.title = p.title;
          if (p.description && !product.description) product.description = p.description;
          if (p.variants?.[0]?.price && !product.source_price) {
            product.source_price = parsePrice(String(p.variants[0].price));
          }
        }
      } catch {}
    }
  });
};

const extractWooCommerce = ($, product) => {
  const priceEl = $('.woocommerce-Price-amount bdi, .woocommerce-Price-amount').first();
  const price = priceEl.text();
  if (price && !product.source_price) product.source_price = parsePrice(price);
  const desc = $('.woocommerce-product-details__short-description, .entry-summary .description').first().text().trim();
  if (desc && desc.length > 30 && !product.description) product.description = desc;
};

const extractAmazon = ($, product) => {
  if (!product.title) product.title = $('#productTitle').text().trim();
  if (!product.source_price) {
    const p = $('.a-price .a-offscreen').first().text() ||
              $('#priceblock_ourprice').text() ||
              $('#priceblock_dealprice').text();
    if (p) product.source_price = parsePrice(p);
  }
  if (!product.description) {
    product.description =
      $('#productDescription p').map((_, el) => $(el).text().trim()).get().join(' ') ||
      $('#feature-bullets .a-list-item').map((_, el) => $(el).text().trim()).get().filter(t => t).join('. ');
  }
};

// ─── Main scraper ─────────────────────────────────────────────────────────────
const scrapeProduct = async (url) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const isNike = domain.includes('nike.com');

    // ── Fetch HTML ─────────────────────────────────────────────────────────
    let html;
    let usedPuppeteer = false;

    try {
      const response = await axios.get(url, {
        headers: BASE_HEADERS(),
        timeout: 25000,
        maxRedirects: 5,
      });
      html = response.data;

      const looksEmpty = !html || html.length < 3000 ||
        /enable javascript|cf-browser-verification|bot detected/i.test(html);

      if (looksEmpty && puppeteerAvailable) {
        console.log(`[scraper] Thin HTML from ${domain}, trying Puppeteer`);
        html = await fetchWithPuppeteer(url);
        usedPuppeteer = true;
      }
    } catch (axiosErr) {
      if (puppeteerAvailable && (axiosErr.response?.status === 403 || axiosErr.code === 'ECONNABORTED')) {
        console.log(`[scraper] Axios failed for ${domain}, trying Puppeteer`);
        try {
          html = await fetchWithPuppeteer(url);
          usedPuppeteer = true;
        } catch {
          throw axiosErr;
        }
      } else {
        throw axiosErr;
      }
    }

    const $ = cheerio.load(html);
    const bodyText = $('body').text();

    const product = {
      source_url: url,
      source_domain: domain,
      title: '',
      description: '',
      source_price: null,
      currency: 'USD',
      images: [],
      variants: []
    };

    // ── 1. JSON-LD ────────────────────────────────────────────────────────
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const d = JSON.parse($(el).html());
        const items = Array.isArray(d) ? d : [d];
        for (const data of items) {
          if (data['@type'] !== 'Product') continue;
          if (data.name && !product.title) product.title = data.name;
          if (data.description && !product.description) {
            product.description = data.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }
          if (!product.source_price) {
            const offers = Array.isArray(data.offers) ? data.offers : [data.offers];
            for (const offer of offers) {
              const p = parsePrice(String(offer?.price || ''));
              if (p) { product.source_price = p; break; }
            }
          }
          if (data.image) {
            const imgs = Array.isArray(data.image) ? data.image : [data.image];
            for (const img of imgs) {
              const src = typeof img === 'string' ? img : (img?.url || img?.contentUrl);
              if (src) product.images.push(upgradeImageUrl(src));
            }
          }
        }
      } catch {}
    });

    // ── 2. Platform extractors ────────────────────────────────────────────
    if (isNike) {
      extractNike($, product);
    } else if (domain.includes('amazon')) {
      extractAmazon($, product);
    } else if ($('body').hasClass('woocommerce') || $('[class*="woocommerce"]').length) {
      extractWooCommerce($, product);
    } else {
      extractShopify($, product);
    }

    // ── 3. Fallback title ─────────────────────────────────────────────────
    if (!product.title) {
      product.title =
        $('meta[property="og:title"]').attr('content') ||
        $('h1[itemprop="name"]').first().text().trim() ||
        $('h1[class*="product"]').first().text().trim() ||
        $('h1').first().text().trim() ||
        $('title').text().trim().split(/[|\-–]/)[0].trim();
    }

    // ── 4. Fallback description ───────────────────────────────────────────
    if (!product.description) {
      const descSelectors = [
        '[itemprop="description"]',
        '[class*="product-description"]',
        '[class*="productDescription"]',
        '[class*="product__description"]',
        '[class*="pdp-description"]',
        '[data-testid*="description"]',
        '[id*="description"]',
        '[class*="description"]',
        '.product-details',
      ];
      for (const sel of descSelectors) {
        const text = $(sel).first().text().replace(/\s+/g, ' ').trim();
        if (text && text.length > 40) { product.description = text; break; }
      }
    }
    if (!product.description) {
      product.description =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') || '';
    }

    // ── 5. Fallback price ─────────────────────────────────────────────────
    if (!product.source_price) {
      const metaPrice =
        $('meta[property="product:price:amount"]').attr('content') ||
        $('meta[property="og:price:amount"]').attr('content') ||
        $('meta[itemprop="price"]').attr('content');
      if (metaPrice) product.source_price = parsePrice(metaPrice);
    }

    if (!product.source_price) {
      // Try to grab price directly from page text near currency symbols
      const rawText = bodyText.substring(0, 5000);
      const priceMatch = rawText.match(/(\d{1,4}[.,]\d{2})\s*€|€\s*(\d{1,4}[.,]\d{2})|£(\d{1,4}[.,]\d{2})|\$(\d{1,4}[.,]\d{2})/);
      if (priceMatch) {
        product.source_price = parsePrice(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4]);
      }
    }

    if (!product.source_price) {
      const priceSelectors = [
        '[itemprop="price"]',
        '[class*="price-item--sale"]', '[class*="price--sale"]',
        '[class*="sale-price"]', '[class*="current-price"]',
        '[class*="product-price"]', '[class*="price__current"]',
        '[data-price]', '[class*="regular-price"]',
        '[data-testid*="price"]', '.price',
      ];
      for (const sel of priceSelectors) {
        const el = $(sel).first();
        const raw = el.attr('content') || el.attr('data-price') || el.attr('data-amount') || el.text();
        const p = parsePrice(raw);
        if (p && p > 0 && p < 100000) { product.source_price = p; break; }
      }
    }

    // ── 6. Currency ───────────────────────────────────────────────────────
    product.currency = detectCurrency(domain, $, bodyText);

    // ── 7. Variants ───────────────────────────────────────────────────────
    product.variants = extractVariants($, product);

    // ── 8. Images ─────────────────────────────────────────────────────────
    const imageMap = new Map();

    const addImage = (src, bonus = 0) => {
      if (!src || typeof src !== 'string') return;
      const upgraded = upgradeImageUrl(src);
      if (!upgraded) return;
      const existing = imageMap.get(upgraded) || -999;
      const score = scoreImage(upgraded, product.title) + bonus;
      if (score >= 0 || bonus > 0) imageMap.set(upgraded, Math.max(existing, score));
    };

    // Seed with images from platform extractors
    for (const img of product.images) addImage(img, 50);
    product.images = [];

    addImage($('meta[property="og:image"]').attr('content'), 40);
    addImage($('meta[property="og:image:secure_url"]').attr('content'), 40);
    addImage($('meta[name="twitter:image"]').attr('content'), 35);

    // Gallery selectors
    const gallerySelectors = [
      '[data-product-image]', '[data-zoom-image]',
      '[class*="product-image"] img', '[class*="product__image"] img',
      '[class*="gallery__image"] img', '[class*="gallery-image"] img',
      '[class*="pdp__image"] img', '[class*="pdp-image"] img',
      '[class*="product-media"] img', '[class*="product_media"] img',
      '[id*="product-image"] img', '[id*="productImage"] img',
      'figure[class*="product"] img',
      '[class*="carousel__slide"] img', '[class*="slider__slide"] img',
      '[class*="swiper-slide"] img',
      '[class*="product-hero"] img',
      '[class*="main-image"] img',
      '[data-testid*="image"] img',
      // Nike-specific
      '[class*="thumbnail"] img',
      '[class*="media-gallery"] img',
      '[class*="image-gallery"] img',
    ];

    for (const sel of gallerySelectors) {
      $(sel).each((_, el) => {
        const $el = $(el);
        const candidates = [
          $el.attr('data-zoom-image'),
          $el.attr('data-zoom'),
          $el.attr('data-large'),
          $el.attr('data-full'),
          $el.attr('data-src'),
          $el.attr('data-lazy-src'),
          $el.attr('data-original'),
          $el.attr('src'),
        ];
        for (const src of candidates) {
          if (src && !src.startsWith('data:')) { addImage(src, 20); break; }
        }

        const srcset = $el.attr('srcset') || $el.attr('data-srcset');
        if (srcset) {
          const best = srcset.split(',')
            .map(s => s.trim().split(/\s+/))
            .filter(p => p.length >= 2)
            .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0]?.[0];
          if (best) addImage(best, 25);
        }
      });
    }

    // Grab ALL img tags as last resort
    if (imageMap.size < 3) {
      $('img').each((_, el) => {
        const $el = $(el);
        const src = $el.attr('src') || $el.attr('data-src') || $el.attr('data-lazy-src');
        const w = parseInt($el.attr('width') || '0');
        const h = parseInt($el.attr('height') || '0');
        if (src && (w > 200 || h > 200 || (!w && !h))) {
          addImage(src, 0);
        }
      });
    }

    product.images = [...imageMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([src]) => src)
      .filter(src => !isJunkImage(src))
      .slice(0, 12);

    // ── 9. Validation ─────────────────────────────────────────────────────
    if (!product.title || /404|not found|page not found/i.test(product.title)) {
      return { success: false, error: 'Product page not found. Please check the URL.' };
    }
    if (!product.source_price || product.source_price <= 0) {
      return {
        success: false,
        error: usedPuppeteer
          ? 'Could not detect price even with full browser rendering. This site may require login.'
          : 'Could not detect the product price. Try pasting a direct product page URL.'
      };
    }

    product.title = product.title.trim();
    product.description = product.description.replace(/\s{3,}/g, '\n\n').trim();

    console.log(`[scraper] ✓ ${domain} | "${product.title}" | ${product.currency} ${product.source_price} | ${product.images.length} images | ${product.variants.length} variants`);

    return { success: true, product };

  } catch (err) {
    if (err.response?.status === 403) return { success: false, error: 'This website blocks scrapers (403). Try a direct product link.' };
    if (err.response?.status === 404) return { success: false, error: 'Product page not found (404).' };
    if (err.response?.status === 429) return { success: false, error: 'Rate limited. Please wait a moment and try again.' };
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') return { success: false, error: 'Request timed out.' };
    if (err.code === 'ENOTFOUND') return { success: false, error: 'Could not reach the website. Check the URL.' };
    return { success: false, error: `Scrape failed: ${err.message}` };
  }
};

module.exports = { scrapeProduct };