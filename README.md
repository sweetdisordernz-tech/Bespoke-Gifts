# Sweet Disorder - Bespoke &amp; Corporate Gifting

Standalone landing page for Sweet Disorder's bespoke/corporate gifting offering. Static HTML/CSS/JS, matching the live sweetdisorder.co.nz brand (same header, nav, and footer as the site), built from the Bespoke Gifting information PDF.

## Structure

Deploy root is `public/` (required for Vercel's zero-config static deploy, see note below).

```
public/
  index.html
  css/styles.css
  js/main.js
  sweet-disorder-logo.png
  favicon.png
  images/
```

## Deploying to Vercel

1. Import this repo into a new Vercel project.
2. Vercel should auto-detect `public/` as the output directory since it's a static site with no framework. If it doesn't, set the project's **Output Directory** to `public`.
3. No environment variables or build step required.

## Content source

All copy is sourced from the "Bespoke Gifting Information" PDF: hero messaging, the four customisation callouts, label colour options, customisable text character limits, the full sweet options list, pricing/MOQ/turnaround, and contact details (molly@sweetdisorder.co.nz / www.sweetdisorder.co.nz / 021 944 997).

## Status

- [x] Header/nav/footer reused from the Chocolate + Coffee Festival landing page (same brand tokens, same links out to the live site)
- [x] Hero, feature callouts, label colour + customisable text, sweet options, pricing, closing CTA sections built from the PDF
- [ ] Add real bespoke-gift product photos to `public/images/` (currently text-only, no imagery)
- [ ] Connect a Vercel project + domain/subdomain
