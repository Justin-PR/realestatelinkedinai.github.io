# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static landing page for "LinkedIn Authority AI" - an AI-powered content automation tool for real estate agents. The website targets successful real estate agents earning $100K+ annually who want to attract high-net-worth clients through LinkedIn.

**Target URL:** realestatelinkedinai.github.io
**Tech Stack:** Pure HTML/CSS/JavaScript (GitHub Pages compatible)
**Primary Goal:** Lead generation with 15%+ email capture rate

## Development Commands

Since this is a static site for GitHub Pages, no build process is required:

```bash
# Serve locally for development (if you have Python)
python -m http.server 8000

# Or with Node.js if http-server is installed
npx http-server

# Deploy: Push to main branch (GitHub Pages auto-deploys)
git push origin main
```

## GitHub Pages Hosting Setup

This project is designed for GitHub Pages hosting at `realestatelinkedinai.github.io`:

**Repository Requirements:**
- Repository must be named `realestatelinkedinai.github.io` for user/org site
- Or use project site format: `<username>.github.io/<repository-name>`
- Files served directly from repository root or `/docs` folder

**GitHub Pages Configuration:**
- Enable GitHub Pages in repository Settings > Pages
- Source: Deploy from branch (usually `main`)
- No Jekyll processing needed (pure HTML/CSS/JS)
- Add `.nojekyll` file to root if you want to bypass Jekyll entirely

**Domain Setup:**
- Default URL: `https://<username>.github.io/<repo-name>`
- Custom domain can be configured in Settings > Pages
- HTTPS is automatically enabled

## Architecture Overview

The project follows a single-page application structure optimized for conversion:

**Recommended File Structure:**
```
/
├── index.html              # Main landing page
├── css/
│   ├── main.css           # Core styles
│   ├── responsive.css     # Mobile breakpoints
│   └── animations.css     # Subtle interactions
├── js/
│   ├── app.js            # Main application logic
│   ├── forms.js          # Lead capture handling
│   └── analytics.js      # Tracking implementation
├── images/
│   ├── hero/             # Hero section visuals
│   ├── features/         # Feature screenshots
│   ├── testimonials/     # Agent photos
│   └── icons/            # UI icons
└── assets/
    ├── fonts/            # Custom typography
    └── data/             # JSON data files
```

## Key Technical Requirements

- **Performance:** <3 second load time (critical for mobile agents)
- **Mobile-First:** Real estate agents browse between showings
- **SEO Keywords:** "LinkedIn real estate automation", "real estate agent marketing"
- **Lead Capture:** Forms must integrate with email service providers
- **Cross-Browser:** Support all major browsers
- **Accessibility:** WCAG 2.1 AA compliance

## Target Audience Psychology

Real estate agents are:
- **Skeptical** but willing to pay premium for proven results
- **Time-pressed** (need instant value demonstration)
- **Results-driven** (focus on ROI and statistics)
- **Professional** (premium aesthetic required)

## Conversion Strategy

**Primary Goals:**
1. Email capture (15%+ target)
2. Demo bookings (3%+ target)
3. Build immediate authority/trust

**Key Pain Points to Address:**
- Low-quality Facebook leads
- Time-consuming LinkedIn management
- Competition with other agents
- Need for consistent content

**Value Proposition:**
"While 90% of agents fight for scraps on Facebook, smart agents use LinkedIn to attract clients who actually have money to buy million-dollar homes."

## Content Guidelines

- Use real estate industry terminology naturally
- Include LinkedIn statistics (277% more leads than Facebook)
- Emphasize exclusivity and premium positioning
- Address skepticism with social proof
- Professional tone (think luxury real estate, not generic SaaS)

## Design Principles

- **Color Scheme:** Professional trust and authority colors
- **Typography:** Highly readable premium fonts
- **Visual Hierarchy:** Guide toward CTAs
- **LinkedIn Integration:** Brand-compliant references
- **Trust Signals:** Testimonials, statistics, credibility badges

## Pricing Tiers Referenced in Context

- Starter: $197/month
- Authority: $397/month  
- Team: $697/month

## Important Context Files

- `context.md`: Complete project requirements and target audience analysis
- `CLAUDE_CODE_CONTEXT.md`: Detailed development prompts and workflow
- `README.md`: Basic project description

## Success Metrics

- Page load speed: <3 seconds
- Mobile bounce rate: <40%
- Form completion rate: >60%
- Email capture rate: 15%+
- Demo booking rate: 3%+