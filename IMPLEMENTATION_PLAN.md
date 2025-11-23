# Implementation Plan: Conditional Debugger + Tutorial UI

**Date:** November 23, 2025
**Goals:**
1. Make debugger attach ONLY when side panel is open (not always running)
2. Add tutorial UI explaining how to use the extension

---

## 🎯 Part 1: Conditional Debugger Attachment

### Current Problem
- Debugger attaches immediately when extension loads
- Stays attached to ChatGPT tabs forever
- Always monitoring, even when panel is closed
- **Privacy concern:** Always active monitoring

### Solution Architecture

#### Flow Diagram

**BEFORE (Current):**
```
Extension Loads → Service Worker Init → Debugger Attaches → Forever Monitoring
```

**AFTER (New):**
```
Extension Loads → Service Worker Init → Debugger WAITS
                                             ↓
                                    Panel Opens → Attach
                                             ↓
                                    Panel Closes → Detach
```

### Code Changes

#### 1. `src/infra/effectDebuggerTap.ts`

**Changes:**
- Export `attachDebugger()` function
- Export `detachDebugger()` function
- Modify `effectInitDebuggerTap()` to NOT auto-attach
- Store callback for later use

**New exports:**
```typescript
export const attachDebugger = (onEvent: (event: SearchEvent) => void): void => {
  // Find ChatGPT tab and attach
}

export const detachDebugger = (): void => {
  // Detach if currently attached
}
```

#### 2. `src/infra/effectServiceWorker.ts`

**Changes:**
- Add panel state tracking: `let isPanelOpen = false`
- Add message handlers for "panel-opened" and "panel-closed"
- Call attach/detach based on panel state

**New message types:**
- `panel-opened` → Call `attachDebugger()`
- `panel-closed` → Call `detachDebugger()`

#### 3. `src/ui/panel.ts`

**Changes:**
- Send "panel-opened" message when panel loads
- Send "panel-closed" message on beforeunload

**Implementation:**
```typescript
// On panel load
chrome.runtime.sendMessage({ type: "panel-opened" });

// On panel unload
window.addEventListener("beforeunload", () => {
  chrome.runtime.sendMessage({ type: "panel-closed" });
});
```

---

## 🎨 Part 2: Tutorial UI

### Design Specification

#### Visual Design

```
╔═══════════════════════════════════════════╗
║   🔍 Getting Started with AI Search       ║
║       Inspector                           ║
╠═══════════════════════════════════════════╣
║                                           ║
║  ➊ 🟢 GO TO CHATGPT                      ║
║     └─→ Ask a question that requires     ║
║         web search                        ║
║         (e.g., "What's the latest        ║
║          news about AI?")                 ║
║                                           ║
║  ➋ 🟡 WAIT FOR RESPONSE                  ║
║     └─→ Let ChatGPT finish completely    ║
║                                           ║
║  ➌ 🔵 CLICK "HARD REFRESH"               ║
║     └─→ This captures searches made      ║
║         before the panel opened           ║
║     └─→ Button is at the top ↑           ║
║                                           ║
║  ➍ 🟣 INSPECT RESULTS                    ║
║     └─→ View queries & results below     ║
║     └─→ Click to expand details          ║
║     └─→ Copy individual or all data      ║
║                                           ║
╚═══════════════════════════════════════════╝
```

#### Color Coding

- **🟢 Green (#10b981):** Action item (Go to ChatGPT)
- **🟡 Yellow (#f59e0b):** Wait/Patience (Wait for response)
- **🔵 Blue (#3b82f6):** Important action (Hard refresh)
- **🟣 Purple (#8b5cf6):** Inspect/View (Results viewing)

### Implementation

#### 1. `sidepanel.html`

Add tutorial section:
```html
<div id="tutorial" class="tutorial">
  <div class="tutorial-header">
    <span class="tutorial-icon">🔍</span>
    <h2>Getting Started</h2>
  </div>

  <div class="tutorial-steps">
    <div class="tutorial-step step-green">
      <div class="step-number">➊</div>
      <div class="step-content">
        <strong>GO TO CHATGPT</strong>
        <div class="step-detail">
          └─→ Ask a question that requires web search
        </div>
      </div>
    </div>

    <!-- More steps... -->
  </div>
</div>
```

#### 2. `sidepanel.html` (CSS)

```css
.tutorial {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  margin: 10px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.step-green { border-left: 4px solid #10b981; }
.step-yellow { border-left: 4px solid #f59e0b; }
.step-blue { border-left: 4px solid #3b82f6; }
.step-purple { border-left: 4px solid #8b5cf6; }
```

#### 3. `src/ui/panel.ts`

Logic to show/hide tutorial:
```typescript
const showTutorial = events.length === 0;
document.getElementById("tutorial").style.display = showTutorial ? "block" : "none";
```

---

## 📝 Commit Strategy

### Commit 1: "Add conditional debugger architecture"
**Files:**
- `src/infra/effectDebuggerTap.ts` - Export attach/detach functions
- `src/infra/effectServiceWorker.ts` - Panel state tracking
- `src/ui/panel.ts` - Send panel-opened/closed messages

**Message:**
```
Add conditional debugger attachment

- Debugger now attaches only when side panel is open
- Panel sends 'panel-opened' message on load
- Service worker attaches debugger in response
- Panel sends 'panel-closed' on unload
- Service worker detaches debugger
- More privacy-friendly: no constant monitoring
```

### Commit 2: "Add tutorial UI for first-time users"
**Files:**
- `sidepanel.html` - Tutorial HTML and CSS
- `src/ui/panel.ts` - Tutorial show/hide logic

**Message:**
```
Add getting started tutorial UI

- Shows when no search events captured yet
- Color-coded 4-step guide with visual arrows
- Explains: Go to ChatGPT → Wait → Hard Refresh → Inspect
- Auto-hides when results appear
- Professional gradient design matching extension theme
```

### Commit 3: "Build extension with new features"
**Files:**
- `latest-build.zip` - Updated build
- `dist/` - Compiled files

**Message:**
```
Build extension v0.1.1

- Conditional debugger attachment (privacy improvement)
- Tutorial UI for new users
- Ready for testing and deployment
```

---

## ✅ Testing Checklist

### Conditional Debugger Tests

- [ ] Extension loads without debugger attached
- [ ] Click extension icon → side panel opens
- [ ] Debugger attaches after panel opens
- [ ] Go to ChatGPT → ask search question
- [ ] Extension captures search data
- [ ] Close panel → debugger detaches
- [ ] Reopen panel → debugger re-attaches

### Tutorial UI Tests

- [ ] Fresh install → tutorial shows
- [ ] No search data → tutorial visible
- [ ] Tutorial has proper colors (green, yellow, blue, purple)
- [ ] Tutorial has arrows and icons
- [ ] Capture data → tutorial auto-hides
- [ ] Tutorial clearly explains Hard Refresh need

---

## 🚀 Success Criteria

1. ✅ Debugger only active when panel is open
2. ✅ Tutorial explains usage clearly
3. ✅ Color-coded visual guide
4. ✅ All functionality still works
5. ✅ No console errors
6. ✅ Extension builds successfully

---

**Implementation Time Estimate:** 45-60 minutes
**Priority:** HIGH (Privacy improvement + UX enhancement)
