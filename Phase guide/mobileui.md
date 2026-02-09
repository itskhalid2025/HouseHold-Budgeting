# Mobile & PWA Redesign Guide: Minimal FinTech + Soft-Neumorphic Hybrid

> [!IMPORTANT]
> **Mobile Only**: These changes MUST strictly apply only to mobile/PWA views (width < 768px). The desktop experience (layout, navigation, routing) must remain completely untouched.

## 0. Strict Viewport Boundary Rule

To prevent "mixing" of mobile and desktop views, the following strict boundary MUST be followed:
- **Mobile Platform**: Viewport width `< 768px`.
- **Desktop Platform**: Viewport width `>= 768px`.

**Technical Specification:**
- **JavaScript**: Use `window.innerWidth < 768` for mobile detection.
- **CSS**:
  - Mobile styles: `@media (max-width: 767px)`
  - Desktop styles: `@media (min-width: 768px)`
- **Isolated Layouts**: Ensure `App.jsx` continues to use conditional rendering to separate mobile and desktop layout shells.

---

## 1. Design Vision: Soft FinTech Professional

This style focuses on high readability, large touch targets, and a premium "app-like" feel for the PWA. It uses soft shadows (neumorphism) to create depth and clarity on small screens.

### Key Visual Principles
1. **PWA-First**: Navigation must be at the bottom (reachable by thumb).
2. **Clarity over Density**: One main action or data point per card.
3. **Touch Targets**: All interactive elements (buttons, inputs) must be at least 44px tall.
4. **Contrast**: High contrast for financial data, soft backgrounds for UI containers.

---

## 2. Global Style Tokens (Mobile)

### 🎨 Light Theme (Soft-Neumorphic)
- **Background**: `#FFFFFF` (Crisp) or `#F4F8FB` (Soft Blue-Grey)
- **Cards**: `#F4F8FB` with soft white/grey shadows.
- **Primary Action**: `#2B7FFF` (Vibrant Blue)
- **Success/Income**: `#00C4A7`
- **Error/Expense**: `#FF4D4D`
- **Shadows**: 
  - `box-shadow: 4px 4px 10px rgba(0,0,0,0.05), -4px -4px 10px rgba(255,255,255,0.8);`

### 🌑 Dark Theme (Deep AMOLED)
- **Background**: `#0E0F15` (Deep Charcoal)
- **Cards**: `#161B22` (Slightly lighter)
- **Primary Action**: `#3C82FF`
- **Success/Accents**: `#2BD9C3` (Neon Teal)
- **Glow Effects**: Used sparingly for active states and charts.
- **Borders**: `1px solid rgba(255,255,255,0.08)` instead of heavy shadows.

---

## 3. Component Specifications

### 📱 Navigation (Navbar.jsx)
- **Position**: Fixed bottom.
- **Style**: High-blur glassmorphism or solid deep background.
- **Items**: 5-tab system (Home, Transactions, Goals, Reports, Settings).
- **Active State**: Indicator bar or glowing icon.

### ➕ Global Action (Smart Entry)
- **Sticky FAB**: A large, circular button in the bottom right (or center of navbar) for "Smart Entry" (Voice/Text/Image).
- **Size**: 56px or 64px diameter.

### 💳 Cards (MobileCard.jsx)
- **Width**: 100% of container (minus padding).
- **Padding**: 16px to 20px.
- **Corners**: 16px to 24px radius (very rounded).
- **Hierarchy**: Large numbers for balances, medium text for labels.

### 📊 Charts
- **Type**: Simplified versions of desktop charts.
- **Interactivity**: Tap to see values (tooltips optimized for touch).
- **Gradients**: Smooth color fills under lines.

---

## 4. Specific Screen Guidelines

### Dashboard (Home)
- **Top Section**: "Hello, [Name]" with Avatar and Link to Household.
- **Quick Summary**: Horizontally scrollable summary cards (Income, Expense, Savings).
- **Main View**: Vertical stack of recent activity or budget progress.

### Transactions / Income
- **List View**: Clean rows with category icons.
- **Filters**: Bottom sheet or sliding drawer for selecting dates/categories.

### Advisor (AI Chat)
- **Chat Interface**: Full-screen chat with large bubbles and clear contrast.
- **Quick Replies**: Rounded pill buttons for suggested questions.

---

## 5. Implementation Strategy

### Phase 1: Foundation
- Update `DashboardMobile.css` to implement the new background and card tokens.
- Standardize `MobileButton` and `MobileInput` components.

### Phase 2: Shell
- Refine `Navbar.jsx` for better thumb reachability and PWA standards.
- Update the `GlobalSmartEntry` FAB to look like a premium tool.

### Phase 3: Content Pages
- Systematic update of `TransactionsMobile`, `SavingsMobile`, etc., ensuring all cards follow the vertical 100%-width rule.

### Phase 4: PWA Polish
- Ensure safe-area insets (`env(safe-area-inset-top/bottom)`) are respected for notch/home-indicator devices.
- Add micro-animations (transitions between pages).
