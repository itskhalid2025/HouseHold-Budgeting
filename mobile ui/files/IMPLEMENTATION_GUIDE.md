# GrowWise Landing Page - Implementation Guide

## 📋 Overview

This is a **premium, animated landing page** for GrowWise, featuring:
- ✨ Stunning logo intro animation (5-second sequence)
- 📱 Fully responsive (mobile & desktop)
- 🎨 Glassmorphism design with smooth transitions
- 🖼️ Integrated product screenshots in feature cards
- 🎯 Framer Motion animations throughout
- 🌓 Theme toggle support (light/dark mode)

---

## 🎬 Animation Timeline

### Initial Load Sequence (5 seconds)

```
0.0s - 0.5s   → Logo scales from center (0.3 → 1.2 → 1.0 scale)
0.5s - 1.8s   → Logo gradient flows (magenta → blue → cyan)
1.8s - 2.6s   → Tagline fades in below logo
2.6s - 4.0s   → Tagline words animate with blur/glow effect
4.0s - 5.0s   → Logo & tagline fade to background
5.0s+         → Main content reveals with stagger animations
```

**User Experience:**
1. Full-screen overlay with gradient background
2. Logo appears dramatically from center
3. Tagline animates word by word
4. Everything smoothly transitions away
5. Main landing page content fades in

---

## 📁 File Structure

```
/pages/Landing/
├── Landing.jsx          ← Main unified component (mobile + desktop)
├── Landing.css          ← All styles including animations
└── (Keep existing component files)
    ├── GrowWiseLogo.jsx
    ├── GrowWiseLogo.css
    ├── TaglineAnimated.jsx
    └── TaglineAnimatedMobile.jsx
```

---

## 🖼️ Image Integration

### Three Screenshots Required:

**1. report_land.PNG**
- Location: `/mnt/user-data/uploads/report_land.PNG`
- Used in: "AI Report Generator" feature card
- Shows: Weekly financial report with charts and insights

**2. ai_advisor_land.PNG**
- Location: `/mnt/user-data/uploads/ai_advisor_land.PNG`
- Used in: "RAG-Powered Financial Advisor" feature card
- Shows: AI chat interface with spending analysis

**3. mobile_land.PNG**
- Location: `/mnt/user-data/uploads/mobile_land.PNG`
- Used in: Mobile showcase section (desktop only)
- Shows: GrowWise mobile dashboard

### Image Paths in Code:
```jsx
// In Landing.jsx, the images are referenced as:
<img src="/mnt/user-data/uploads/report_land.PNG" alt="..." />
<img src="/mnt/user-data/uploads/ai_advisor_land.PNG" alt="..." />
<img src="/mnt/user-data/uploads/mobile_land.PNG" alt="..." />

// If images are in public folder, change paths to:
<img src="/images/report_land.PNG" alt="..." />
// etc.
```

---

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install framer-motion lucide-react
```

*Note: If you already have these installed, skip this step.*

### 2. File Placement

Place the files in your React project:

```bash
# Main component
src/pages/Landing/Landing.jsx

# Styles
src/pages/Landing/Landing.css

# Make sure you have these existing components:
src/components/GrowWiseLogo.jsx
src/components/GrowWiseLogo.css
src/components/TaglineAnimated.jsx
src/components/TaglineAnimatedMobile.jsx
```

### 3. Image Setup

**Option A: Public Folder (Recommended)**
```bash
# Move images to public directory
public/
└── images/
    ├── report_land.PNG
    ├── ai_advisor_land.PNG
    └── mobile_land.PNG

# Update image paths in Landing.jsx:
src="/images/report_land.PNG"
```

**Option B: Import in Component**
```jsx
// At top of Landing.jsx
import reportImage from '../../assets/images/report_land.PNG';
import advisorImage from '../../assets/images/ai_advisor_land.PNG';
import mobileImage from '../../assets/images/mobile_land.PNG';

// Then use:
<img src={reportImage} alt="..." />
```

### 4. Update Routes

In your `App.jsx` or router configuration:

```jsx
import Landing from './pages/Landing/Landing';

// In your routes:
<Route path="/" element={<Landing />} />
```

### 5. Theme Context

Ensure you have a ThemeContext. If not, create one:

```jsx
// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
```

Wrap your app:
```jsx
// In main.jsx or App.jsx
import { ThemeProvider } from './context/ThemeContext';

<ThemeProvider>
    <App />
</ThemeProvider>
```

---

## 🎨 CSS Variables Required

Add these to your global CSS (or root CSS file):

```css
:root {
    /* Primary colors */
    --primary: #6366f1;
    --primary-light: #667eea;
    --primary-dark: #4f46e5;
    
    /* Light theme */
    --background: #ffffff;
    --text: #1a1a1a;
    --text-secondary: #6b7280;
    --card-bg: rgba(255, 255, 255, 0.8);
    --border: rgba(0, 0, 0, 0.1);
    --bg-glass: rgba(255, 255, 255, 0.95);
}

[data-theme="dark"] {
    /* Dark theme */
    --background: #0f0f1e;
    --text: #ffffff;
    --text-secondary: #9ca3af;
    --card-bg: rgba(255, 255, 255, 0.05);
    --border: rgba(255, 255, 255, 0.1);
    --bg-glass: rgba(26, 26, 46, 0.95);
}
```

---

## 📱 Responsive Breakpoints

The landing page automatically adapts:

- **Mobile**: < 768px
  - Single column layouts
  - Smaller fonts and spacing
  - Simplified content
  - Uses `TaglineAnimatedMobile`

- **Desktop**: ≥ 768px
  - Multi-column grids
  - Larger typography
  - Full content descriptions
  - Uses `TaglineAnimated`
  - Shows mobile showcase section

---

## ✨ Key Features

### 1. Logo Intro Animation
- Full-screen overlay on first load
- Dramatic scale and fade effects
- Gradient background matching theme
- Grid pattern animation
- Auto-completes after 5 seconds

### 2. Scroll Animations
- Fade-up effects as sections come into view
- Stagger delays for grid items
- Uses Framer Motion's `whileInView`
- Triggers only once (`viewport={{ once: true }}`)

### 3. Hover Effects
- Cards lift up (-8px) on hover
- Shadow intensifies
- Border glows with primary color
- Icons scale and rotate
- Images scale slightly (1.02x)

### 4. Interactive Elements
- Smooth theme toggle
- Animated CTA buttons
- Hover states on all clickable items
- Navigation to login/register

---

## 🎯 Section Breakdown

### 1. Hero Section
- Gradient background with grid overlay
- Animated headline and description
- Feature badges (Track, Analyze, Improve)
- Primary CTA button with sparkle icon

### 2. Why Use GrowWise
- 4 benefit cards in grid
- Icon animations on hover
- Responsive layout

### 3. AI Power Section ⭐
- **Most important section**
- 3 feature cards with detailed lists
- **Contains 2 product screenshots**:
  - Report Generator card shows `report_land.PNG`
  - AI Advisor card shows `ai_advisor_land.PNG`
- Glassmorphism cards
- Hover effects on images

### 4. How It Helps
- 4 benefit cards
- Desktop: Shows mobile mockup with `mobile_land.PNG`
- Mobile: Simple grid layout

### 5. Household Section
- 2 cards: Create or Join
- Icons: Users and Shield
- Centered layout

### 6. Final CTA
- Gradient background with dots pattern
- Login and Register buttons
- Responsive button layout

### 7. Footer
- Links to Features, Contact, Privacy, Terms
- Copyright notice
- Hover underline animations

---

## 🔧 Customization Options

### Change Animation Duration
```jsx
// In Landing.jsx, find LogoIntro component
useEffect(() => {
    const timer = setTimeout(() => {
        onComplete();
    }, 5000); // Change this number (milliseconds)
    // ...
}, [onComplete]);
```

### Disable Intro Animation
```jsx
// In Landing component
const [showIntro, setShowIntro] = useState(false); // Change true to false
```

### Adjust Colors
```css
/* In Landing.css or global CSS */
:root {
    --primary: #your-color;
    --primary-light: #your-light-color;
    --primary-dark: #your-dark-color;
}
```

### Modify Scroll Animation Delays
```jsx
// In Landing.jsx, find motion.div elements
transition={{ delay: 0.1, duration: 0.6 }}
//              ↑ Adjust this for timing
```

---

## 🐛 Troubleshooting

### Issue: Images Not Showing
**Solution:**
```jsx
// Check image paths match your folder structure
// If in public/images/:
src="/images/report_land.PNG"

// If in src/assets/:
import reportImage from './assets/images/report_land.PNG';
```

### Issue: Animations Not Smooth
**Solution:**
```css
/* Add to your global CSS */
* {
    transform: translateZ(0);
    backface-visibility: hidden;
}
```

### Issue: Theme Toggle Not Working
**Solution:**
```jsx
// Ensure ThemeContext is properly set up
// Check console for errors
// Verify data-theme attribute is being set on <html>
```

### Issue: Mobile Layout Broken
**Solution:**
```css
/* Check viewport meta tag in index.html */
<meta name="viewport" content="width=device-width, initial-scale=1.0">

/* Ensure responsive CSS is loaded */
@media (max-width: 768px) { ... }
```

---

## 📊 Performance Optimization

### Image Optimization (Recommended)
```bash
# Convert PNG to WebP for better performance
# Using ImageMagick or similar tool:
convert report_land.PNG -quality 85 report_land.webp
```

Then update image tags:
```jsx
<picture>
    <source srcSet="/images/report_land.webp" type="image/webp" />
    <img src="/images/report_land.PNG" alt="..." />
</picture>
```

### Lazy Loading
Images already have `loading="lazy"` attribute for performance.

### Reduce Motion Preference
The CSS includes a `prefers-reduced-motion` media query that respects user preferences.

---

## 🎨 Design Tokens

### Spacing Scale
- Small: 15px, 20px
- Medium: 30px, 40px
- Large: 60px, 80px

### Border Radius
- Small: 12px, 15px
- Medium: 20px
- Large: 50px (pills)

### Shadows
- Soft: `0 4px 15px rgba(0, 0, 0, 0.05)`
- Medium: `0 8px 25px rgba(0, 0, 0, 0.2)`
- Strong: `0 12px 35px rgba(0, 0, 0, 0.3)`

### Typography
- Hero H1: `clamp(2.5rem, 6vw, 4rem)`
- Section Title: `clamp(2rem, 4vw, 2.5rem)`
- Body: `clamp(1rem, 2vw, 1.2rem)`

---

## 🚢 Deployment Checklist

- [ ] All images are in correct directory
- [ ] Image paths updated in Landing.jsx
- [ ] ThemeContext is set up
- [ ] CSS variables defined
- [ ] Framer Motion installed
- [ ] lucide-react installed
- [ ] Routes configured
- [ ] Mobile responsiveness tested
- [ ] Performance optimized (WebP, lazy loading)
- [ ] Accessibility checked (alt tags, contrast)
- [ ] Browser compatibility tested

---

## 📞 Navigation Setup

The landing page uses `react-router-dom` for navigation:

```jsx
// Buttons navigate to:
onClick={() => navigate('/login')}
onClick={() => navigate('/register')}
onClick={() => navigate('/features')}
onClick={() => navigate('/contact')}
onClick={() => navigate('/privacy')}
onClick={() => navigate('/terms')}
```

Ensure these routes exist in your app.

---

## 🎭 Animation States

### Component States
1. **Loading**: Intro animation playing
2. **Complete**: Main content visible
3. **Scrolling**: Sections animate in view
4. **Interacting**: Hover effects active

### Motion Variants Used
- `initial`: Starting state
- `animate`: End state
- `whileInView`: Triggers on scroll
- `whileHover`: Triggers on mouse over
- `whileTap`: Triggers on click/tap

---

## 🌟 Best Practices

1. **First Load**: Intro animation plays once
2. **Images**: Use WebP format for 30-50% size reduction
3. **Animations**: Keep under 60fps for smoothness
4. **Accessibility**: All images have alt text
5. **SEO**: Semantic HTML structure maintained
6. **Performance**: Lazy loading on all images

---

## 📝 Notes for Developer

### Key Implementation Points:

1. **Unified Component**: No separate Mobile/Desktop files
   - One `Landing.jsx` handles both
   - Uses `window.innerWidth` to detect screen size
   - Conditionally renders content based on `isMobile` state

2. **Image Paths**: 
   - Currently set to `/mnt/user-data/uploads/...`
   - **You must update these** to match your project structure
   - Recommendation: Use `/images/` in public folder

3. **Dependencies**:
   ```json
   {
     "framer-motion": "^10.x.x",
     "lucide-react": "^0.x.x",
     "react-router-dom": "^6.x.x"
   }
   ```

4. **Existing Components Required**:
   - `GrowWiseLogo` (with flowing gradient animation)
   - `TaglineAnimated` (for desktop)
   - `TaglineAnimatedMobile` (for mobile)
   - `ThemeContext` (for theme toggle)

5. **Animation Library**: Framer Motion
   - Used for all transitions
   - Scroll-based animations
   - Gesture-based interactions

---

## 🎨 Visual Hierarchy

```
Priority 1: Logo Intro (5 seconds)
    ↓
Priority 2: Hero Section (immediate attention)
    ↓
Priority 3: AI Power Section (with images - main selling point)
    ↓
Priority 4: Benefits & Features
    ↓
Priority 5: Final CTA
```

---

## 💡 Tips for Success

1. **Test on Real Devices**: Animations may perform differently
2. **Optimize Images**: Use compression tools
3. **Monitor Performance**: Keep bundle size under control
4. **User Testing**: Get feedback on animation timing
5. **Accessibility**: Test with screen readers
6. **Dark Mode**: Verify all elements are visible in both themes

---

## 🔗 Related Files

- `GrowWiseLogo.jsx` - Logo component with gradient
- `GrowWiseLogo.css` - Logo-specific animations
- `TaglineAnimated.jsx` - Desktop tagline
- `TaglineAnimatedMobile.jsx` - Mobile tagline
- Theme context provider

---

## ✅ Success Criteria

Your implementation is successful when:

- ✅ Logo intro plays smoothly on page load
- ✅ All 3 product images are visible in correct sections
- ✅ Mobile and desktop layouts work perfectly
- ✅ Theme toggle switches between light/dark
- ✅ All animations are smooth (60fps)
- ✅ Hover effects work on interactive elements
- ✅ Navigation buttons work correctly
- ✅ Responsive across all screen sizes
- ✅ No console errors
- ✅ Fast page load time (<3s)

---

## 📞 Support

For questions about implementation:
1. Check image paths first
2. Verify all dependencies installed
3. Review ThemeContext setup
4. Test on different screen sizes
5. Check browser console for errors

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Built with**: React + Framer Motion + Tailwind-inspired CSS
