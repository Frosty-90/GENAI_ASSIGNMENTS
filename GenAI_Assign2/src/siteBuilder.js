function titleFromBrand(brandName) {
  return brandName?.trim() || "Website";
}

function detectSiteArchetype({ inspirationSite = "", brief = "" }) {
  const text = `${inspirationSite} ${brief}`.toLowerCase();

  if (
    text.includes("amazon") ||
    text.includes("shopping") ||
    text.includes("ecommerce") ||
    text.includes("e-commerce") ||
    text.includes("store") ||
    text.includes("product listing") ||
    text.includes("cart")
  ) {
    return "commerce";
  }

  if (text.includes("scaler")) {
    return "learning";
  }

  return "marketing";
}

function isScalerInspired(inspirationSite = "", brief = "") {
  const text = `${inspirationSite} ${brief}`.toLowerCase();
  return text.includes("scaler");
}

function getReferenceLabel(inspirationSite = "") {
  return inspirationSite?.trim() || "a reference website";
}

function buildScalerLikeContent({ brandName, brief, inspirationSite, requiredSections }) {
  const sectionLine = requiredSections.length ? `Required sections: ${requiredSections.join(", ")}.` : "";

  return {
    title: `${titleFromBrand(brandName)} | AI-first Learning`,
    eyebrow: "For the next decade of builders",
    headline: "Build a career that stays relevant in the age of AI.",
    body:
      "An editorial, high-trust learning brand with a calm premium interface, proof-led messaging, and a focused technical tone inspired by modern Scaler-style storytelling.",
    primaryCta: "Explore Programs",
    secondaryCta: "Talk To An Advisor",
    proof: [
      { label: "Learner community", value: "100,000+" },
      { label: "Median outcomes focus", value: "High-growth roles" },
      { label: "Learning format", value: "Live + Projects" },
    ],
    features: [
      {
        label: "AI-integrated learning",
        copy: "Every learning surface is framed around how engineers and analysts now work with AI in the loop.",
      },
      {
        label: "Strong technical foundations",
        copy: "The page balances ambition with credibility through systems, problem-solving, and career depth.",
      },
      {
        label: "Mentor-led execution",
        copy: "Visual language stays premium and grounded instead of leaning on noisy bootcamp tropes.",
      },
    ],
    footerNote:
      `A learning-focused front-end inspired by the reference site. ${sectionLine}`.trim(),
    referenceLabel: `Inspired by ${getReferenceLabel(inspirationSite)}`,
  };
}

function buildGenericContent({ brandName, brief, inspirationSite, requiredSections }) {
  const sectionLine = requiredSections.length ? `Required sections: ${requiredSections.join(", ")}.` : "";
  const inspirationLine = inspirationSite
    ? `This build is shaped around the visual language of ${getReferenceLabel(inspirationSite)}.`
    : "This page is a minimal front-end build using HTML, CSS, and JavaScript.";

  return {
    title: `${titleFromBrand(brandName)} | Landing Page`,
    eyebrow: "Generated from a natural-language prompt",
    headline: `Launch ${titleFromBrand(brandName)} with a polished web presence.`,
    body: brief ? `${brief} ${inspirationLine}` : inspirationLine,
    primaryCta: "Get Started",
    secondaryCta: "Learn More",
    proof: [
      { label: "Experience", value: "Conversational" },
      { label: "Output", value: "HTML/CSS/JS" },
      { label: "Workflow", value: "Step-based agent" },
    ],
    features: [
      {
        label: "Prompt-driven structure",
        copy: "The agent maps the request into sections, content, and supporting interaction states.",
      },
      {
        label: "Real output files",
        copy: "The final result opens directly in the browser without additional tooling.",
      },
      {
        label: "Extensible tool loop",
        copy: "The same CLI can be expanded with more tools, actions, and reasoning policies.",
      },
    ],
    footerNote: `A minimal front-end build shaped from the project brief. ${sectionLine}`.trim(),
    referenceLabel: inspirationSite ? `Reference site: ${getReferenceLabel(inspirationSite)}` : "Reference site: custom brief",
  };
}

function buildCommerceContent({ brandName, brief, inspirationSite, requiredSections }) {
  const sectionLine = requiredSections.length ? `Required sections: ${requiredSections.join(", ")}.` : "";

  return {
    title: `${titleFromBrand(brandName)} | Online Store`,
    announcement: "Free delivery on eligible orders and everyday essentials.",
    categories: ["Today's Deals", "Mobiles", "Fashion", "Home", "Electronics", "Appliances"],
    heroTitle: "Shop top picks, trending deals, and everyday essentials.",
    heroText:
      "A minimal ecommerce homepage inspired by the structure of large shopping websites, with fast browsing, strong hierarchy, and clear product discovery.",
    heroTags: ["Fast delivery", "Best sellers", "Top offers"],
    dealCards: [
      {
        title: "Up to 70% off",
        copy: "Home, kitchen, and daily-use products.",
      },
      {
        title: "Mobiles and accessories",
        copy: "Popular devices, chargers, and audio gear.",
      },
      {
        title: "Fashion refresh",
        copy: "Daily styles for men, women, and kids.",
      },
      {
        title: "Gaming and gadgets",
        copy: "Accessories and entertainment essentials.",
      },
    ],
    products: [
      { name: "Wireless Headphones", price: "$59", meta: "Noise control and 30h battery" },
      { name: "Smart Watch", price: "$89", meta: "Fitness tracking and AMOLED display" },
      { name: "Coffee Maker", price: "$79", meta: "Compact design for everyday use" },
      { name: "Laptop Backpack", price: "$39", meta: "Water-resistant with multiple compartments" },
      { name: "Bluetooth Speaker", price: "$45", meta: "Portable audio with deep bass" },
      { name: "Air Fryer", price: "$99", meta: "Fast cooking with easy-clean basket" },
    ],
    footerNote: `A storefront build inspired by the reference shopping site. ${sectionLine}`.trim(),
    referenceLabel: inspirationSite ? `Inspired by ${getReferenceLabel(inspirationSite)}` : "Reference site: online store",
  };
}

function getContent(input) {
  const archetype = detectSiteArchetype(input);

  if (archetype === "commerce") {
    return {
      archetype,
      ...buildCommerceContent(input),
    };
  }

  if (isScalerInspired(input.inspirationSite, input.brief)) {
    return {
      archetype,
      ...buildScalerLikeContent(input),
    };
  }

  return {
    archetype,
    ...buildGenericContent(input),
  };
}

function createHtml({ brandName, content }) {
  if (content.archetype === "commerce") {
    return createCommerceHtml({ brandName, content });
  }

  if (content.archetype === "learning") {
    return createScalerHtml({ brandName, content });
  }

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${content.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div class="page-shell">
      <header class="site-header">
        <div class="brand-lockup">
          <div class="brand-mark">${brandName.trim().charAt(0) || "A"}</div>
          <div>
            <p class="brand-name">${brandName}</p>
            <p class="brand-meta">Generated by a conversational CLI agent</p>
          </div>
        </div>

        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          Menu
        </button>

        <nav class="site-nav" id="site-nav">
          <a href="#hero">Home</a>
          <a href="#highlights">Highlights</a>
          <a href="#footer">Contact</a>
        </nav>
      </header>

      <main>
        <section class="hero" id="hero">
          <div class="hero-copy">
            <p class="eyebrow">${content.eyebrow}</p>
            <h1>${content.headline}</h1>
            <p class="hero-text">${content.body}</p>

            <div class="hero-actions">
              <a href="#highlights" class="primary-btn">${content.primaryCta}</a>
              <a href="#footer" class="secondary-btn">${content.secondaryCta}</a>
            </div>
          </div>

          <div class="hero-visual">
            <div class="visual-card">
              <p>Reference</p>
              <strong>${brandName}</strong>
              <span>HTML + CSS + JavaScript output</span>
              <em>${content.referenceLabel}</em>
            </div>
          </div>
        </section>

        <section class="highlights" id="highlights">
          <div class="section-heading">
            <p class="eyebrow">Highlights</p>
            <h2>A minimal front-end clone, grounded in structure and tone.</h2>
          </div>

          <div class="proof-grid">
          ${content.proof
            .map(
              (item) => `
          <article>
            <span>${item.label}</span>
            <strong>${item.value}</strong>
          </article>`
            )
            .join("")}
          </div>

          <div class="feature-grid">
            ${content.features
              .map(
                (feature, index) => `
            <article class="feature-card">
              <span>0${index + 1}</span>
              <h3>${feature.label}</h3>
              <p>${feature.copy}</p>
            </article>`
              )
              .join("")}
          </div>
        </section>
      </main>

      <footer class="site-footer" id="footer">
        <div>
          <p class="brand-name">${brandName}</p>
          <p>${content.footerNote}</p>
        </div>
        <div class="footer-links">
          <a href="#hero">Back to top</a>
          <a href="#highlights">Highlights</a>
          <span class="footer-meta">Minimal HTML/CSS/JS build</span>
        </div>
      </footer>
    </div>

    <script src="./script.js"></script>
  </body>
</html>
`;
}

function createScalerHtml({ brandName, content }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${content.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body class="scaler-body">
    <div class="scaler-shell">
      <header class="scaler-header">
        <div class="scaler-brand">
          <div class="scaler-badge">S</div>
          <div>
            <p class="scaler-name">${brandName}</p>
            <p class="scaler-meta">AI-first Tech Education</p>
          </div>
        </div>

        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          Menu
        </button>

        <nav class="scaler-nav site-nav" id="site-nav">
          <a href="#hero">Home</a>
          <a href="#programs">Programs</a>
          <a href="#difference">Why Scaler</a>
          <a href="#footer">Footer</a>
        </nav>

        <a class="scaler-cta" href="#footer">Request Callback</a>
      </header>

      <main>
        <section class="scaler-hero" id="hero">
          <div class="scaler-copy">
            <span class="scaler-eyebrow">The market has already changed</span>
            <h1>Become the professional built for the next decade in AI.</h1>
            <p>
              Strong technical foundations, AI embedded into every stage, and a learning journey that keeps pace
              with how engineering and data teams actually work today.
            </p>

            <div class="scaler-actions">
              <a class="scaler-primary" href="#programs">Explore Programs</a>
              <a class="scaler-secondary" href="#difference">Why Scaler</a>
            </div>

            <div class="program-pill-row" id="programs">
              <span>Modern Software & AI Engineering</span>
              <span>Modern Data Science & ML</span>
              <span>Advanced AI/ML</span>
              <span>DevOps, Cloud & AI Platform</span>
            </div>
          </div>

          <div class="scaler-panel">
            <div class="score-card">
              <p>AI-ready profile</p>
              <strong>92 / 100</strong>
              <span>${content.referenceLabel}</span>
            </div>

            <div class="mini-grid">
              <article>
                <span>Programs</span>
                <strong>4 Tracks</strong>
              </article>
              <article>
                <span>Ratings</span>
                <strong>25K+ Learners</strong>
              </article>
              <article>
                <span>Mentorship</span>
                <strong>1:1 Support</strong>
              </article>
              <article>
                <span>Access</span>
                <strong>Lifelong</strong>
              </article>
            </div>
          </div>
        </section>

        <section class="proof-strip">
          ${content.proof
            .map(
              (item) => `
          <article>
            <span>${item.label}</span>
            <strong>${item.value}</strong>
          </article>`
            )
            .join("")}
        </section>

        <section class="difference-section" id="difference">
          <div class="section-heading">
            <span class="scaler-eyebrow">Why Scaler</span>
            <h2>Built differently, designed to last.</h2>
            <p>
              A calm, premium learning interface inspired by Scaler's current AI-first positioning: clear hierarchy,
              concise copy, and strong technical credibility.
            </p>
          </div>

          <div class="difference-grid">
            ${content.features
              .map(
                (feature, index) => `
            <article class="difference-card">
              <span>0${index + 1}</span>
              <h3>${feature.label}</h3>
              <p>${feature.copy}</p>
            </article>`
              )
              .join("")}
          </div>
        </section>
      </main>

      <footer class="scaler-footer" id="footer">
        <div>
          <p class="scaler-name">${brandName}</p>
          <p>${content.footerNote}</p>
        </div>

        <div class="footer-links">
          <a href="#hero">Back to top</a>
          <a href="#programs">Programs</a>
          <a href="#difference">Why Scaler</a>
        </div>
      </footer>
    </div>

    <script src="./script.js"></script>
  </body>
</html>
`;
}

function createCommerceHtml({ brandName, content }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${content.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body class="commerce-body">
    <header class="commerce-header">
      <div class="top-strip">
        <p>${content.announcement}</p>
      </div>

      <div class="header-main">
        <div class="logo-block">
          <div class="logo-mark">${brandName.trim().charAt(0) || "A"}</div>
          <div>
            <p class="logo-name">${brandName}</p>
            <p class="logo-meta">${content.referenceLabel}</p>
          </div>
        </div>

        <form class="search-shell">
          <input type="text" placeholder="Search products, categories, and deals" aria-label="Search products" />
          <button type="button">Search</button>
        </form>

        <div class="header-actions">
          <a href="#products">Orders</a>
          <a href="#products">Wishlist</a>
          <a href="#products">Cart</a>
        </div>
      </div>

      <nav class="category-bar">
        ${content.categories.map((item) => `<a href="#products">${item}</a>`).join("")}
      </nav>
    </header>

    <main class="commerce-shell">
      <section class="commerce-hero">
        <div class="commerce-copy">
          <span class="commerce-eyebrow">Shopping homepage clone</span>
          <h1>${content.heroTitle}</h1>
          <p>${content.heroText}</p>
          <div class="hero-tags">
            ${content.heroTags.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </div>

        <div class="commerce-promo">
          <p>Featured Section</p>
          <strong>Daily Deals</strong>
          <span>Discover limited-time offers across top categories.</span>
        </div>
      </section>

      <section class="deal-grid">
        ${content.dealCards
          .map(
            (item) => `
        <article class="deal-card">
          <h2>${item.title}</h2>
          <p>${item.copy}</p>
          <a href="#products">Shop now</a>
        </article>`
          )
          .join("")}
      </section>

      <section class="products-section" id="products">
        <div class="section-copy">
          <span>Top picks</span>
          <h2>Popular products across major categories.</h2>
        </div>

        <div class="product-grid">
          ${content.products
            .map(
              (item) => `
          <article class="product-card">
            <div class="product-thumb">${item.name.charAt(0)}</div>
            <h3>${item.name}</h3>
            <p>${item.meta}</p>
            <div class="product-row">
              <strong>${item.price}</strong>
              <button type="button">Add to cart</button>
            </div>
          </article>`
            )
            .join("")}
        </div>
      </section>
    </main>

    <footer class="commerce-footer">
      <div>
        <p class="logo-name">${brandName}</p>
        <p>${content.footerNote}</p>
      </div>

      <div class="footer-links">
        <a href="#products">Products</a>
        <a href="#top">Top</a>
        <span>Minimal HTML/CSS/JS storefront</span>
      </div>
    </footer>

    <script src="./script.js"></script>
  </body>
</html>
`;
}

function createCss() {
  return `:root {
  --bg: #f3f4f6;
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --text: #111827;
  --muted: #5b6472;
  --line: #d9dee7;
  --accent: #f59e0b;
  --accent-strong: #ea580c;
  --navy: #111827;
  --navy-soft: #1f2937;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: "Manrope", "Segoe UI", sans-serif;
  color: var(--text);
  background: var(--bg);
}

.page-shell {
  width: min(1080px, calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 36px;
}

.site-header,
.hero,
.feature-grid,
.site-footer,
.proof-grid {
  display: grid;
  gap: 18px;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  padding: 18px 0;
  background: rgba(8, 17, 29, 0.92);
  backdrop-filter: blur(12px);
}

.brand-lockup,
.hero-actions,
.site-nav,
.footer-links {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-toggle {
  display: none;
  appearance: none;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text);
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #08111f;
  font-weight: 800;
}

.brand-name,
.brand-meta,
.eyebrow {
  margin: 0;
}

.brand-name {
  font-size: 0.92rem;
  letter-spacing: 0.22em;
  font-weight: 800;
}

.brand-meta,
.site-nav a,
.footer-links a,
.hero-text,
.feature-card p,
.site-footer p,
.proof-grid span {
  color: var(--muted);
}

.site-nav a,
.footer-links a {
  text-decoration: none;
}

.site-nav a:hover,
.footer-links a:hover {
  color: var(--text);
}

.hero {
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  min-height: calc(100svh - 82px);
  padding: 32px 0 12px;
}

.eyebrow {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.78rem;
  font-weight: 800;
}

.hero h1,
.section-heading h2 {
  margin: 12px 0 16px;
  line-height: 1;
  letter-spacing: -0.05em;
}

.hero h1 {
  max-width: 11ch;
  font-size: clamp(3rem, 7vw, 5.3rem);
}

.hero-text,
.feature-card p,
.site-footer p {
  line-height: 1.75;
}

.primary-btn,
.secondary-btn {
  text-decoration: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 800;
}

.primary-btn {
  color: #08111f;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
}

.secondary-btn {
  color: var(--text);
  border: 1px solid var(--line);
}

.hero-visual {
  min-height: 320px;
  display: grid;
  place-items: center;
}

.visual-card,
.proof-grid article,
.feature-card,
.site-footer {
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
}

.visual-card {
  width: min(100%, 380px);
  padding: 24px;
}

.visual-card p,
.visual-card span,
.visual-card em {
  margin: 0;
  color: var(--muted);
}

.visual-card strong {
  display: block;
  margin: 10px 0;
  font-size: 1.9rem;
}

.visual-card em {
  display: block;
  margin-top: 14px;
  font-style: normal;
}

.highlights {
  padding-top: 72px;
}

.proof-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 22px;
}

.proof-grid article,
.feature-card,
.site-footer {
  padding: 24px;
}

.proof-grid strong {
  display: block;
  margin-top: 8px;
  font-size: 1.45rem;
}

.section-heading {
  max-width: 760px;
}

.section-heading h2 {
  font-size: clamp(2.2rem, 4.8vw, 3.6rem);
}

.feature-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 20px;
}

.feature-card span {
  color: var(--accent);
  font-size: 0.82rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.feature-card h3 {
  margin: 18px 0 12px;
  font-size: 1.35rem;
}

.site-footer {
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-top: 72px;
}

.footer-meta {
  color: var(--muted);
}

.scaler-body {
  background:
    radial-gradient(circle at 12% 8%, rgba(41, 74, 145, 0.28), transparent 24%),
    radial-gradient(circle at 88% 12%, rgba(245, 177, 91, 0.14), transparent 20%),
    linear-gradient(180deg, #06101b 0%, #08111d 100%);
  color: #eef3fb;
}

.scaler-shell {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding-bottom: 36px;
}

.scaler-header,
.scaler-hero,
.proof-strip,
.difference-grid,
.scaler-footer {
  display: grid;
  gap: 18px;
}

.scaler-header {
  position: sticky;
  top: 0;
  z-index: 20;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  padding: 18px 0;
  background: rgba(8, 17, 29, 0.92);
  backdrop-filter: blur(12px);
}

.scaler-brand,
.scaler-nav,
.scaler-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.scaler-nav {
  justify-self: center;
}

.scaler-brand {
  gap: 12px;
}

.scaler-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f4b15b, #eb8b2d);
  color: #08111f;
  font-weight: 800;
}

.scaler-name,
.scaler-meta,
.scaler-eyebrow {
  margin: 0;
}

.scaler-name {
  color: #eef3fb;
  font-size: 0.92rem;
  letter-spacing: 0.22em;
  font-weight: 800;
}

.scaler-meta,
.scaler-nav a,
.scaler-copy p,
.score-card p,
.score-card span,
.mini-grid span,
.difference-card p,
.scaler-footer p,
.proof-strip span,
.footer-links a {
  color: #afbbcf;
}

.scaler-nav a,
.footer-links a {
  text-decoration: none;
}

.scaler-nav a:hover,
.footer-links a:hover {
  color: #eef3fb;
}

.scaler-cta,
.scaler-primary,
.scaler-secondary {
  text-decoration: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 800;
}

.scaler-cta,
.scaler-primary {
  background: linear-gradient(135deg, #f4b15b, #eb8b2d);
  color: #08111f;
}

.scaler-secondary {
  color: #eef3fb;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.scaler-hero {
  grid-template-columns: 1.08fr 0.92fr;
  align-items: center;
  min-height: calc(100svh - 88px);
  padding: 34px 0 16px;
}

.scaler-copy h1,
.section-heading h2 {
  margin: 12px 0 16px;
  line-height: 0.97;
  letter-spacing: -0.05em;
}

.scaler-copy h1 {
  max-width: 11ch;
  font-size: clamp(3.4rem, 8vw, 6rem);
}

.scaler-copy p,
.difference-card p,
.scaler-footer p {
  line-height: 1.75;
}

.scaler-eyebrow {
  color: #f4b15b;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 0.78rem;
  font-weight: 800;
}

.program-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.program-pill-row span {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #afbbcf;
  font-size: 0.92rem;
}

.scaler-panel,
.proof-strip article,
.difference-card,
.scaler-footer {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  background: rgba(12, 22, 40, 0.76);
  backdrop-filter: blur(14px);
}

.scaler-panel {
  padding: 24px;
}

.score-card strong {
  display: block;
  margin: 10px 0;
  font-size: 2.8rem;
  color: #eef3fb;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.mini-grid article,
.proof-strip article {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.mini-grid strong,
.proof-strip strong {
  display: block;
  margin-top: 8px;
  color: #eef3fb;
}

.proof-strip {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 10px;
}

.difference-section {
  padding-top: 86px;
}

.section-heading {
  max-width: 760px;
}

.section-heading h2 {
  color: #eef3fb;
  font-size: clamp(2.3rem, 5vw, 4rem);
}

.section-heading p {
  color: #afbbcf;
  line-height: 1.75;
}

.difference-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 24px;
}

.difference-card {
  padding: 24px;
}

.difference-card span {
  color: #f4b15b;
  font-size: 0.82rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.difference-card h3 {
  margin: 18px 0 12px;
  color: #eef3fb;
  font-size: 1.35rem;
}

.scaler-footer {
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-top: 86px;
  padding: 24px;
}

.commerce-body {
  background: #e7eaef;
}

.commerce-header {
  position: sticky;
  top: 0;
  z-index: 20;
}

.top-strip {
  background: var(--navy);
  color: #fff;
  padding: 10px 20px;
  text-align: center;
  font-size: 0.9rem;
}

.top-strip p {
  margin: 0;
}

.header-main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 16px 24px;
  background: var(--navy-soft);
  color: #fff;
}

.logo-block,
.header-actions,
.category-bar,
.hero-tags,
.footer-links {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-mark {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #111827;
  font-weight: 800;
}

.logo-name,
.logo-meta {
  margin: 0;
}

.logo-name {
  font-weight: 800;
  letter-spacing: 0.08em;
}

.logo-meta,
.header-actions a,
.category-bar a,
.commerce-copy p,
.deal-card p,
.product-card p,
.commerce-footer p,
.footer-links a,
.footer-links span {
  color: #d1d8e5;
}

.header-actions a,
.category-bar a,
.footer-links a {
  text-decoration: none;
}

.search-shell {
  display: grid;
  grid-template-columns: 1fr auto;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
}

.search-shell input,
.search-shell button {
  border: 0;
  font: inherit;
}

.search-shell input {
  padding: 14px 16px;
  color: #111827;
}

.search-shell button {
  padding: 0 18px;
  background: var(--accent);
  color: #111827;
  font-weight: 800;
}

.category-bar {
  flex-wrap: wrap;
  padding: 12px 24px;
  background: #263446;
}

.commerce-shell {
  width: min(1320px, calc(100% - 32px));
  margin: 24px auto 48px;
}

.commerce-hero {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 20px;
  align-items: stretch;
}

.commerce-copy,
.commerce-promo,
.deal-card,
.product-card,
.commerce-footer {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
}

.commerce-copy,
.commerce-promo {
  padding: 28px;
}

.commerce-eyebrow,
.section-copy span {
  display: inline-block;
  color: #925b03;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.commerce-copy h1,
.section-copy h2 {
  margin: 12px 0 14px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.commerce-copy h1 {
  max-width: 12ch;
  font-size: clamp(2.7rem, 6vw, 4.6rem);
}

.commerce-copy p,
.commerce-promo span,
.deal-card p,
.product-card p,
.commerce-footer p {
  color: var(--muted);
  line-height: 1.7;
}

.hero-tags {
  flex-wrap: wrap;
  margin-top: 20px;
}

.hero-tags span {
  padding: 10px 12px;
  border-radius: 999px;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  color: var(--text);
  font-size: 0.9rem;
}

.commerce-promo p,
.commerce-promo strong,
.commerce-promo span {
  display: block;
}

.commerce-promo p {
  margin: 0;
  color: var(--muted);
}

.commerce-promo strong {
  margin: 12px 0 10px;
  font-size: 2rem;
}

.deal-grid,
.product-grid {
  display: grid;
  gap: 18px;
}

.deal-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 22px;
}

.deal-card,
.product-card {
  padding: 22px;
}

.deal-card h2,
.product-card h3 {
  margin: 0 0 10px;
}

.deal-card a {
  color: #0f5cad;
  text-decoration: none;
  font-weight: 700;
}

.products-section {
  margin-top: 32px;
}

.product-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 18px;
}

.product-thumb {
  display: grid;
  place-items: center;
  height: 150px;
  border-radius: 16px;
  background: #eef1f5;
  color: #344257;
  font-size: 2rem;
  font-weight: 800;
}

.product-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
}

.product-row button {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: #ffd814;
  color: #111827;
  font: inherit;
  font-weight: 800;
}

.commerce-footer {
  width: min(1320px, calc(100% - 32px));
  margin: 0 auto 36px;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px;
}

@media (max-width: 1100px) {
  .deal-grid,
  .product-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 960px) {
  .site-header,
  .hero,
  .site-footer,
  .header-main,
  .commerce-hero,
  .commerce-footer,
  .scaler-header,
  .scaler-hero,
  .scaler-footer {
    grid-template-columns: 1fr;
  }

  .proof-grid,
  .feature-grid,
  .proof-strip,
  .difference-grid {
    grid-template-columns: 1fr 1fr;
  }

  .site-header {
    gap: 12px;
  }

  .scaler-nav {
    justify-self: start;
    flex-wrap: wrap;
  }
}

@media (max-width: 720px) {
  .page-shell,
  .commerce-shell,
  .commerce-footer,
  .scaler-shell {
    width: min(100% - 24px, 1320px);
  }

  .proof-grid,
  .feature-grid,
  .deal-grid,
  .product-grid,
  .proof-strip,
  .difference-grid,
  .mini-grid {
    grid-template-columns: 1fr;
  }

  .menu-toggle {
    display: inline-flex;
    justify-content: center;
  }

  .site-nav {
    display: none;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 0 0;
  }

  .site-nav.open {
    display: flex;
  }

  .hero {
    min-height: auto;
    padding-top: 16px;
  }

  .hero h1,
  .commerce-copy h1 {
    max-width: 100%;
    font-size: clamp(2.6rem, 14vw, 4.5rem);
  }

  .scaler-copy h1 {
    max-width: 100%;
    font-size: clamp(2.8rem, 15vw, 4.9rem);
  }

  .header-actions,
  .category-bar,
  .hero-tags,
  .footer-links,
  .program-pill-row {
    flex-wrap: wrap;
  }
}
`;
}

function createJs() {
  return `const toggleButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

if (toggleButton && nav) {
  toggleButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });
}
`;
}

export function createWebsiteProjectFiles(input) {
  const content = getContent(input);
  const brandName = input.brandName?.trim() || "Generated Brand";

  return {
    "index.html": createHtml({ brandName, content }),
    "styles.css": createCss(),
    "script.js": createJs(),
  };
}
