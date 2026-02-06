# Dependencies & Package Information

## Required NPM Packages

Add these to your `package.json`:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0"
  }
}
```

## Installation Commands

### Full Install
```bash
npm install react-router-dom framer-motion lucide-react
```

### Individual Installs
```bash
# React Router (for navigation)
npm install react-router-dom

# Framer Motion (for animations)
npm install framer-motion

# Lucide React (for icons)
npm install lucide-react
```

## Package Details

### Framer Motion (v10.16+)
**Purpose**: Animation library for React
**Why**: Powers all the smooth transitions, scroll animations, and intro sequence
**Size**: ~100KB gzipped
**Docs**: https://www.framer.com/motion/

**Used For**:
- Logo intro animation
- Scroll-triggered animations (whileInView)
- Hover effects (whileHover)
- Page transitions
- Stagger animations

**Key Components Used**:
```jsx
import { motion, AnimatePresence } from 'framer-motion';

// Examples:
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
<AnimatePresence>{showIntro && <LogoIntro />}</AnimatePresence>
```

---

### Lucide React (v0.294+)
**Purpose**: Icon library
**Why**: Clean, modern SVG icons for UI elements
**Size**: Tree-shakeable (only imports used icons)
**Docs**: https://lucide.dev/

**Icons Used**:
```jsx
import { 
    Sun, Moon,           // Theme toggle
    Sparkles,           // AI features
    BarChart3,          // Analytics
    Brain,              // AI advisor
    Mic, Image, Type,   // Input methods
    Upload,             // File upload
    TrendingUp,         // Tracking
    Shield, Users,      // Household
    CheckCircle,        // Lists
    Zap, Globe, DollarSign  // Additional features
} from 'lucide-react';
```

---

### React Router DOM (v6.20+)
**Purpose**: Navigation and routing
**Why**: Handle page navigation between login, register, features, etc.
**Size**: ~30KB gzipped
**Docs**: https://reactrouter.com/

**Used For**:
```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
onClick={() => navigate('/login')}
onClick={() => navigate('/register')}
```

---

## Optional but Recommended

### TypeScript Support
```bash
npm install --save-dev @types/react @types/react-dom
```

### Image Optimization
```bash
npm install sharp  # For build-time image optimization
```

### Performance Monitoring
```bash
npm install web-vitals  # For performance metrics
```

---

## Project Setup from Scratch

If starting a new React project:

### Using Vite (Recommended - Faster)
```bash
npm create vite@latest growwise-landing -- --template react
cd growwise-landing
npm install
npm install react-router-dom framer-motion lucide-react
```

### Using Create React App
```bash
npx create-react-app growwise-landing
cd growwise-landing
npm install react-router-dom framer-motion lucide-react
```

---

## File Structure After Setup

```
growwise-landing/
├── node_modules/
├── public/
│   ├── images/
│   │   ├── report_land.PNG
│   │   ├── ai_advisor_land.PNG
│   │   └── mobile_land.PNG
│   └── index.html
├── src/
│   ├── pages/
│   │   └── Landing/
│   │       ├── Landing.jsx
│   │       └── Landing.css
│   ├── components/
│   │   ├── GrowWiseLogo.jsx
│   │   ├── GrowWiseLogo.css
│   │   ├── TaglineAnimated.jsx
│   │   └── TaglineAnimatedMobile.jsx
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js (or webpack.config.js)
```

---

## Environment Setup

### 1. Node.js Version
Recommended: Node 18+ or Node 20 LTS
```bash
node --version  # Should be v18.0.0 or higher
```

### 2. Package Manager
Works with npm, yarn, or pnpm:
```bash
# npm (comes with Node.js)
npm --version

# or yarn
yarn --version

# or pnpm
pnpm --version
```

---

## Build Configuration

### Vite Config (vite.config.js)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['framer-motion', 'lucide-react']
  }
})
```

### For Production Build
```bash
npm run build
```

This will optimize:
- Bundle size
- Code splitting
- Image compression
- Tree shaking (remove unused code)

---

## Development Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  }
}
```

Run:
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
```

---

## Browser Support

The landing page works on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Android

**Features Used**:
- CSS Grid
- Flexbox
- CSS Variables
- Backdrop Filter (glassmorphism)
- CSS Animations
- IntersectionObserver (for scroll animations)

**Polyfills**: Not required for modern browsers

---

## CSS Preprocessor (Optional)

If you want to use SASS/SCSS:
```bash
npm install --save-dev sass
```

Then rename `Landing.css` to `Landing.scss`

---

## Debugging Tools

### React DevTools
Browser extension for debugging React components
- Chrome: https://chrome.google.com/webstore (search "React Developer Tools")
- Firefox: https://addons.mozilla.org/firefox/ (search "React DevTools")

### Framer Motion DevTools
```bash
npm install --save-dev @framer/motion-devtools
```

Add to your component:
```jsx
import { MotionDevTools } from '@framer/motion-devtools'

<MotionDevTools />
```

---

## Testing Setup (Optional)

### For Unit Tests
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### For E2E Tests
```bash
npm install --save-dev @playwright/test
```

---

## Performance Optimization Packages

### Image Optimization
```bash
npm install --save-dev vite-plugin-imagemin
```

### Bundle Analysis
```bash
npm install --save-dev rollup-plugin-visualizer
```

### Compression
```bash
npm install --save-dev vite-plugin-compression
```

---

## Common Issues & Solutions

### Issue: "Module not found: framer-motion"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build size too large
**Solution:**
1. Enable tree shaking
2. Use dynamic imports
3. Optimize images
4. Remove unused dependencies

### Issue: Animations laggy
**Solution:**
1. Enable GPU acceleration in CSS
2. Reduce animation complexity
3. Use `will-change` CSS property sparingly
4. Check browser hardware acceleration

---

## Version Compatibility Matrix

| Package | Min Version | Recommended | Max Tested |
|---------|-------------|-------------|------------|
| React | 18.0.0 | 18.2.0 | 18.3.0 |
| React DOM | 18.0.0 | 18.2.0 | 18.3.0 |
| React Router | 6.0.0 | 6.20.0 | 6.21.0 |
| Framer Motion | 10.0.0 | 10.16.0 | 11.0.0 |
| Lucide React | 0.200.0 | 0.294.0 | 0.300.0 |

---

## License Information

**GrowWise Landing Page**: Custom (your license)

**Dependencies**:
- React: MIT License
- Framer Motion: MIT License
- Lucide React: ISC License
- React Router: MIT License

All open-source and free to use commercially.

---

## Additional Resources

### Framer Motion
- Docs: https://www.framer.com/motion/
- Examples: https://www.framer.com/motion/examples/
- Tutorial: https://www.framer.com/motion/introduction/

### Lucide Icons
- Gallery: https://lucide.dev/icons/
- React Docs: https://lucide.dev/guide/packages/lucide-react

### React Router
- Docs: https://reactrouter.com/en/main
- Tutorial: https://reactrouter.com/en/main/start/tutorial

---

## Contact & Support

For package-specific issues:
- Framer Motion: https://github.com/framer/motion/issues
- Lucide: https://github.com/lucide-icons/lucide/issues
- React Router: https://github.com/remix-run/react-router/discussions

---

**Last Updated**: February 2026
**Maintained By**: GrowWise Development Team
