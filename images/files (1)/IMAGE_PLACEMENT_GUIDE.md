# 📸 Image Placement Quick Reference

## Image File Mapping

### Source → Destination

```
YOUR UPLOADS:
├── mobile_land.PNG
│   → COPY TO: public/assets/landing/mobile-land.png
│
├── report_land.PNG
│   → COPY TO: public/assets/landing/report-land.png
│
├── ai_advisor_land.PNG
│   → COPY TO: public/assets/landing/ai-advisor-land.png
│
└── ChatGPT_Image_Feb_6__2026__05_27_29_PM.png
    → COPY TO: public/assets/landing/ChatGPT_Image_Feb_6__2026__05_27_29_PM.png
```

## Image Usage in Landing Page

### 1. Starry Background (ChatGPT_Image_Feb_6__2026__05_27_29_PM.png)
```
LOCATION: Entire page background
CSS CLASS: .starry-background
FILE PATH: /assets/landing/ChatGPT_Image_Feb_6__2026__05_27_29_PM.png

USAGE:
- Fixed background image
- Covers entire viewport
- Opacity: 0.7 (light theme) / 0.9 (dark theme)
- Applied via CSS background-image
```

### 2. Mobile App Screenshot (mobile-land.png)
```
LOCATION 1 (Desktop): Hero Section - Floating Right
CSS CLASS: .hero-mobile-preview
FILE PATH: /assets/landing/mobile-land.png

DISPLAY:
- Desktop: Floating on right side of hero
- Position: Absolute, right: -100px, bottom: 50px
- Width: 320px
- Parallax effect on scroll
- Hidden on mobile

LOCATION 2 (Mobile): How It Helps Section
CSS CLASS: .mobile-showcase-mobile
FILE PATH: /assets/landing/mobile-land.png

DISPLAY:
- Mobile only (<768px)
- Centered layout
- Max-width: 350px
- Shows below benefits grid
```

### 3. Report Screenshot (report-land.png)
```
LOCATION: AI Power Section → 2nd Feature Card
CARD: "AI Report Generator"
CSS CLASS: .feature-card-image
FILE PATH: /assets/landing/report-land.png

FEATURES:
- Appears in middle feature card
- Hover overlay effect
- Interactive "View Sample Report" text
- Border radius: 15px
- Shadow effect
- Scale on hover: 1.05
```

### 4. AI Advisor Screenshot (ai-advisor-land.png)
```
LOCATION: AI Power Section → 3rd Feature Card
CARD: "RAG-Powered Financial Advisor AI"
CSS CLASS: .feature-card-image
FILE PATH: /assets/landing/ai-advisor-land.png

FEATURES:
- Appears in last feature card
- Hover overlay effect
- Interactive "Try AI Advisor" text
- Border radius: 15px
- Shadow effect
- Scale on hover: 1.05
```

## Visual Layout Map

```
┌─────────────────────────────────────────────────────────────┐
│                    STARRY BACKGROUND                        │
│              (ChatGPT_Image_Feb_6__2026...)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  HERO SECTION                         │  │
│  │  ┌──────────────────────────────┐  ┌─────────────┐   │  │
│  │  │   Title & Description        │  │  mobile-    │   │  │
│  │  │   CTA Buttons                │  │  land.png   │   │  │
│  │  └──────────────────────────────┘  │  (Desktop)  │   │  │
│  │                                     └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              WHY USE GROWWISE                         │  │
│  │         (Benefit cards - no images)                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AI POWER SECTION                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐      │  │
│  │  │   Card 1   │  │   Card 2   │  │   Card 3   │      │  │
│  │  │ (No image) │  │ report-    │  │ ai-advisor-│      │  │
│  │  │            │  │ land.png   │  │ land.png   │      │  │
│  │  └────────────┘  └────────────┘  └────────────┘      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           HOW IT HELPS (Mobile)                       │  │
│  │           ┌─────────────┐                             │  │
│  │           │ mobile-     │  (Mobile only)              │  │
│  │           │ land.png    │                             │  │
│  │           └─────────────┘                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              HOUSEHOLD SECTION                        │  │
│  │         (Household cards - no images)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              FINAL CTA SECTION                        │  │
│  │         (CTA buttons - no images)                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   FOOTER                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Image Specifications

### mobile-land.png
- **Type:** Mobile app screenshot
- **Recommended size:** 300-400px width
- **Aspect ratio:** 9:16 (typical phone)
- **Format:** PNG or WebP
- **Usage:** 2 locations (desktop hero + mobile section)

### report-land.png
- **Type:** Report dashboard screenshot
- **Recommended size:** 800-1200px width
- **Aspect ratio:** 16:9 or wider
- **Format:** PNG or WebP
- **Usage:** Feature card in AI section

### ai-advisor-land.png
- **Type:** AI chat interface screenshot
- **Recommended size:** 800-1200px width
- **Aspect ratio:** 16:9 or wider
- **Format:** PNG or WebP
- **Usage:** Feature card in AI section

### ChatGPT_Image_Feb_6__2026__05_27_29_PM.png
- **Type:** Starry space background
- **Recommended size:** 1920x1080 or higher
- **Aspect ratio:** Any (will cover)
- **Format:** PNG or JPG
- **Usage:** Fixed background across all sections

## Responsive Behavior

### Desktop (≥768px)
```
mobile-land.png:
  - Hero: Visible (floating right)
  - Mobile section: Hidden

report-land.png & ai-advisor-land.png:
  - Full width within cards
  - Hover effects active
```

### Mobile (<768px)
```
mobile-land.png:
  - Hero: Hidden
  - Mobile section: Visible (centered)

report-land.png & ai-advisor-land.png:
  - Full width within cards
  - Touch-optimized
  - Overlay effects on tap
```

## CSS References

### Background Image
```css
.starry-background {
    background-image: url('/assets/landing/ChatGPT_Image_Feb_6__2026__05_27_29_PM.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}
```

### Feature Card Images
```css
.feature-card-image img {
    src: "/assets/landing/report-land.png"  /* or ai-advisor-land.png */
    width: 100%;
    height: auto;
    border-radius: 15px;
}
```

### Mobile Preview
```css
.hero-mobile-preview img {
    src: "/assets/landing/mobile-land.png"
    width: 100%;
    border-radius: 30px;
}
```

## Testing Checklist

After placing images, verify:

- [ ] Starry background loads and covers entire page
- [ ] Background is fixed (doesn't scroll with content)
- [ ] Mobile preview appears on desktop hero (right side)
- [ ] Mobile preview hidden on mobile devices
- [ ] Report screenshot appears in 2nd feature card
- [ ] AI Advisor screenshot appears in 3rd feature card
- [ ] Hover overlays work on feature images
- [ ] Mobile section image appears only on mobile
- [ ] All images maintain aspect ratio
- [ ] Images are sharp (not pixelated)
- [ ] Loading times are acceptable
- [ ] Images work in both light and dark themes

## Optimization Tips

1. **Compress images before uploading:**
   - Use TinyPNG or similar tools
   - Target: <500KB per image

2. **Consider WebP format:**
   - Better compression
   - Wider browser support now

3. **Add lazy loading:**
   - Already included in code
   - Improves initial page load

4. **Test on slow connections:**
   - Use browser dev tools
   - Network throttling

## Common Issues & Fixes

### Issue: Images not loading
```
✓ Check file paths are exact (case-sensitive)
✓ Verify files are in public/assets/landing/
✓ Clear browser cache (Ctrl+Shift+R)
✓ Check browser console for 404 errors
```

### Issue: Background not showing
```
✓ Verify file name matches exactly
✓ Check CSS is properly loaded
✓ Inspect element to see applied styles
✓ Try absolute path: /assets/landing/...
```

### Issue: Images too large/small
```
✓ Check CSS max-width settings
✓ Verify image dimensions in source files
✓ Use browser inspector to debug sizing
✓ Adjust CSS if needed
```

### Issue: Hover effects not working
```
✓ Verify JavaScript is enabled
✓ Check framer-motion is installed
✓ Test on different browsers
✓ Inspect for CSS conflicts
```

---

## Quick Copy Commands (Terminal)

If your images are in project root:
```bash
# Create directory
mkdir -p public/assets/landing

# Copy images (adjust paths as needed)
cp mobile_land.PNG public/assets/landing/mobile-land.png
cp report_land.PNG public/assets/landing/report-land.png
cp ai_advisor_land.PNG public/assets/landing/ai-advisor-land.png
cp ChatGPT_Image_Feb_6__2026__05_27_29_PM.png public/assets/landing/
```

For Windows PowerShell:
```powershell
# Create directory
New-Item -ItemType Directory -Force -Path "public\assets\landing"

# Copy images
Copy-Item "mobile_land.PNG" "public\assets\landing\mobile-land.png"
Copy-Item "report_land.PNG" "public\assets\landing\report-land.png"
Copy-Item "ai_advisor_land.PNG" "public\assets\landing\ai-advisor-land.png"
Copy-Item "ChatGPT_Image_Feb_6__2026__05_27_29_PM.png" "public\assets\landing\"
```

---

**Remember:** All paths in code assume files are in `public/assets/landing/` directory!
