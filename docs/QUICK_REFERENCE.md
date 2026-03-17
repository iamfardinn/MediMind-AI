# MediMind AI - Quick Reference Guide
**Last Updated:** March 16, 2026

---

## 🚀 QUICK START

### Project Structure
```
a:\project\
├── src/
│   ├── pages/
│   │   ├── Chat.tsx              ✅ Updated with spacing fixes
│   │   ├── SymptomChecker.tsx    ✅ Verified (no changes needed)
│   │   ├── MyDashboard.tsx       ✅ Updated with DeviceSync
│   │   └── ...
│   ├── components/
│   │   ├── DeviceSync.tsx        ✅ Google Fit issues fixed
│   │   └── ...
│   └── ...
└── [Documentation files]
```

---

## 📍 WHERE THINGS ARE

### Main UI Pages
| Page | Route | Status | Notes |
|------|-------|--------|-------|
| Chat | `/chat` | ✅ Fixed | Centered + proper spacing |
| Symptom Analyzer | `/symptoms` | ✅ OK | Already proper layout |
| Dashboard | `/` | ✅ Updated | DeviceSync integrated |
| User Dashboard | `/dashboard` | ✅ Updated | DeviceSync in overview |

### Components
| Component | Location | Status | Purpose |
|-----------|----------|--------|---------|
| DeviceSync | `src/components/DeviceSync.tsx` | ✅ Fixed | Wearable integrations |
| Navbar | `src/components/Navbar.tsx` | ⏳ OK | Navigation |
| Chat Store | `src/store/useChatStore.ts` | ⏳ OK | Chat + Vitals state |

---

## 🎨 SPACING REFERENCE

### Common Spacing Values (in Tailwind)
```
Margin/Padding: mb-6 mb-8 mb-10 mb-12 mb-14
Gap: gap-3.5 gap-5 gap-12 gap-16 lg:gap-24
Padding: px-6 sm:px-10 lg:px-16 py-12
```

### Chat Page Examples
```
Badge:              mb-9
Heading:            mb-8
Description:        mb-12
Feature Grid:       mb-14 with gap-5
Column Gap:         gap-16 lg:gap-24
CTA Button:         mt-4 for emphasis
```

---

## 🎯 COMPONENT LOCATIONS IN CODE

### Chat Page Before Login View
**File:** `src/pages/Chat.tsx` (lines 100-200)
```tsx
<div style={{ height: 'calc(100vh - 80px)' }}>
  <div className="absolute inset-0 flex items-center justify-center...">
    {/* Heading, features, CTA */}
  </div>
</div>
```

### Chat Page Logged-in View
**File:** `src/pages/Chat.tsx` (lines 250+)
```tsx
<div className="flex flex-col w-full max-w-4xl mx-auto px-3 sm:px-6 md:px-10">
  {/* Messages */}
</div>
```

### DeviceSync in Dashboard
**File:** `src/pages/MyDashboard.tsx` (lines 330+)
```tsx
{activeTab === 'overview' && (
  <div>
    {/* Stats, Actions, Activity */}
    <motion.div {...fadeUp(0.4)}>
      <DeviceSync />
    </motion.div>
  </div>
)}
```

---

## 🔧 COMMON TASKS

### Adding New Spacing
1. Use Tailwind classes: `mb-6`, `px-10`, `gap-5`
2. Follow existing pattern: `mb-8` for headings, `mb-12` for descriptions
3. Test on mobile, tablet, desktop
4. Ensure touch targets are 48px+

### Modifying DeviceSync
1. Edit `src/components/DeviceSync.tsx`
2. State is in component (use context/store for persistence)
3. Both providers handled independently
4. Connect buttons trigger `handleConnect(provider)`
5. Disconnect buttons trigger `handleDisconnect(provider)`

### Adding New Page Features
1. Copy spacing pattern from Chat.tsx or MyDashboard.tsx
2. Use `max-w-4xl` or `max-w-xl` for containers
3. Center on mobile: `flex flex-col items-center`
4. Left-align on desktop: `lg:items-start`
5. Test responsive behavior

---

## ⚠️ COMMON PITFALLS

### Don't Do This ❌
```tsx
// Non-standard width
<div className="max-w-215">

// No centering on mobile
<div className="lg:items-start"> {/* Missing mobile center */}

// Disabled state blocking both buttons
disabled={connected !== null}

// Connected state for single provider
const [connected, setConnected] = useState<'apple' | 'google' | null>(null)

// No error handling
onClick={() => connectProvider()}
```

### Do This Instead ✅
```tsx
// Standard Tailwind width
<div className="max-w-4xl">

// Centering on mobile, left on desktop
<div className="flex flex-col items-center lg:items-start">

// Each button only disabled during its own connection
disabled={connecting === 'google'}

// Independent provider states
const [connected, setConnected] = useState<{ apple?: boolean; google?: boolean }>({})

// With error handling
const [error, setError] = useState<{ apple?: string; google?: string }>({})
onClick={() => handleConnect('google')} // Sets error on failure
```

---

## 📱 RESPONSIVE BREAKPOINTS

### Tailwind Breakpoints Used
```
sm:   640px   (small screens/landscape phones)
lg:   1024px  (tablets/large screens)
(no prefix): mobile first
```

### Example Pattern
```tsx
{/* Mobile: centered, full width; Desktop: left-aligned */}
<div className="w-full lg:flex-1 max-w-xl flex flex-col items-center lg:items-start">
```

---

## 🧪 TESTING CHECKLIST

### Before Committing Changes
- [ ] Compiles without TypeScript errors
- [ ] Mobile view (375px) looks good
- [ ] Tablet view (768px) looks good
- [ ] Desktop view (1920px) looks good
- [ ] Buttons are clickable
- [ ] Text is readable
- [ ] No console errors
- [ ] Keyboard navigation works

### Before Deploying
- [ ] All QA tests pass
- [ ] User feedback reviewed
- [ ] Performance metrics acceptable
- [ ] No accessibility violations
- [ ] Documentation updated

---

## 🔗 IMPORTANT FILES

| File | Purpose | Last Updated |
|------|---------|--------------|
| INTEGRATION_COMPLETE.md | Project overview | Mar 16 |
| CHAT_PAGE_VISUAL_GUIDE.md | Chat spacing details | Mar 16 |
| DEVICESYNC_INTEGRATION_GUIDE.md | DeviceSync docs | Mar 16 |
| PROJECT_STATUS_REPORT.md | Full status | Mar 16 |

---

## 💻 USEFUL COMMANDS

### Development
```powershell
cd a:\project
npm install        # Install dependencies
npm run dev       # Start dev server (Vite)
npm run build     # Production build
npm run preview   # Preview build
```

### Code Quality
```powershell
npm run lint      # Check linting (if configured)
npm run type-check # Check TypeScript
npm run format    # Format code (if configured)
```

---

## 🎓 LEARNING PATHS

### For CSS/Layout Updates
1. Read: `CHAT_PAGE_VISUAL_GUIDE.md`
2. Example: Chat.tsx lines 100-200
3. Practice: Update another page using same pattern

### For Component Integration
1. Read: `DEVICESYNC_INTEGRATION_GUIDE.md`
2. Example: MyDashboard.tsx lines 330+
3. Practice: Integrate another component

### For Bug Fixes
1. Check: Compilation errors first
2. Search: Find similar pattern in codebase
3. Test: Verify at all breakpoints
4. Document: Update relevant guide

---

## 🐛 DEBUGGING TIPS

### TypeScript Errors
```
Look for: red squiggly lines in VS Code
Check: Function signatures, state types
Solution: Hover over error for fix suggestion
```

### Styling Issues
```
Check: Class name spelling (Tailwind is case-sensitive)
Verify: Mobile-first approach (no prefix = mobile)
Test: At actual breakpoint widths (375, 768, 1920)
```

### Button Not Working
```
Check: onClick handler defined
Verify: Not disabled (check disabled prop logic)
Test: No other parent onClick preventDefault
```

### Layout Broken After Changes
```
Check: Closing tags match opening tags
Verify: Parent div has proper display property
Search: Related CSS that might override
```

---

## 📞 ASK FOR HELP ON

| Issue | Where to Look |
|-------|----------------|
| Chat page spacing | CHAT_PAGE_VISUAL_GUIDE.md |
| DeviceSync not showing | DEVICESYNC_INTEGRATION_GUIDE.md |
| Button state issues | DeviceSync.tsx comments |
| Responsive layout | Chat.tsx centering pattern |
| Compilation errors | See error message, search codebase |

---

## ✨ BEST PRACTICES

1. **Always test mobile first**
   - Design for 320px width minimum
   - Then enhance for larger screens

2. **Use consistent spacing**
   - Follow existing margin/padding scale
   - Don't create new values randomly

3. **Comment your changes**
   - Why, not what (code shows what)
   - Reference this guide if helpful

4. **Keep components focused**
   - One responsibility per component
   - Use composition over nesting

5. **Test before committing**
   - All three breakpoints (mobile/tablet/desktop)
   - All interactive elements
   - All error states

---

## 🚦 STATUS INDICATORS

### File Status
- ✅ Complete & Working
- ⚠️ Works but needs attention
- ❌ Broken/Needs fix
- ⏳ In progress/Not started

### Feature Status
- 🟢 Production ready
- 🟡 Demo/Beta mode
- 🔴 Not implemented

---

## 📋 FINAL CHECKLIST

Before you start coding:
- [ ] Read relevant documentation (above)
- [ ] Understand the existing pattern
- [ ] Have VS Code open with project
- [ ] Run `npm run dev` successfully
- [ ] Know what you're changing and why

After you're done:
- [ ] TypeScript compiles (0 errors)
- [ ] Tested at 3 breakpoints
- [ ] No console errors
- [ ] Keyboard navigation works
- [ ] Updated this guide if needed
- [ ] Committed with clear message

---

**Version:** 1.0
**Last Reviewed:** March 16, 2026
**Next Review:** After staging deployment
