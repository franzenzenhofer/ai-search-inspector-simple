# Testing Guide - How to Verify the Fix Works

## Quick Start

1. **Load the Extension**
   ```
   Chrome → Extensions → Load unpacked → Select the /dist folder
   ```

2. **Open ChatGPT**
   - Go to https://chatgpt.com
   - The extension will auto-attach the debugger

3. **Open the Sidebar**
   - Click the extension icon in Chrome toolbar
   - The sidebar panel will open

## What You'll See

### 1. Live Log Section (at the top)
This is your debugging console - **always visible** with a black terminal-style background:

```
[10:33:45 PM] [INFO] [capture] debugger attached | {"tabId":123}
[10:33:52 PM] [INFO] [parse] Parsing response from https://chatgpt.com/backend-api/conversation/...
[10:33:52 PM] [INFO] [parse] Parsed 3 search events (2 with results, 5 total results)
[10:33:52 PM] [INFO] [parse] Event: "Franz Enzenhofer" → 1 results
[10:33:52 PM] [INFO] [parse] Event: "Franz Enzenhofer SEO" → 2 results
[10:33:52 PM] [INFO] [parse] Event: "Franz Enzenhofer Vienna" → 2 results
```

**What to look for**:
- ✅ `Parsing response from...` = Extension captured a response
- ✅ `Parsed X search events (Y with results, Z total results)` = Parsing succeeded!
- ✅ `Event: "query" → N results` = Each query with its result count
- ❌ `No search events found` = Response didn't contain search data (normal for non-search responses)
- ❌ `Failed to parse search events` = Error occurred (shouldn't happen!)

### 2. Summary Table
Shows aggregated statistics:

| Query | Count | Results | Sample link | Last seen |
|-------|-------|---------|-------------|-----------|
| "Franz Enzenhofer" | 3 | 1 | franzai.com | 10:36:20 PM |
| "Franz Enzenhofer" SEO" | 2 | 2 | fullstackoptimization.com | 10:36:21 PM |

**Before the fix**: Results column would show **0** even when results existed!
**After the fix**: Shows actual result counts!

### 3. Events Section (detailed view)
Click any event to expand and see:

```
"Franz Enzenhofer" FullStackOptimization" (1 results, status: 200)
├── Request: GET https://chatgpt.com/backend-api/conversation/...
├── Timing: 2025-11-22T21:35:14.205Z → 2025-11-22T21:35:17.254Z
├── Results:
│   1. Franz Enzenhofer - FullStackOptimization
│      https://www.fullstackoptimization.com/p/team
│      [Copy] [Google] [Bing]
└── RAW RESPONSE (162161 bytes) [Copy Raw]
    {...full JSON response...}
```

## Testing Scenarios

### Scenario 1: Single Search
1. In ChatGPT, ask: **"Who is Franz Enzenhofer?"**
2. Wait for ChatGPT to search and respond
3. Check the sidebar:
   - ✅ Log shows "Parsing response"
   - ✅ Log shows "Event: ... → X results"
   - ✅ Summary shows the query with result count
   - ✅ Events section shows the query expanded with actual links

### Scenario 2: Multiple Searches
1. In ChatGPT, ask: **"Compare Franz Enzenhofer's work in SEO and AI"**
2. ChatGPT may perform multiple searches
3. Check the sidebar:
   - ✅ Log shows multiple "Event: ..." entries
   - ✅ Summary shows multiple rows
   - ✅ Each query has its own result set

### Scenario 3: Verify the Bug is Fixed
1. Use the exact scenario from the bug report:
   - Ask ChatGPT something that triggers searches about "Franz Enzenhofer FullStackOptimization"
2. **Before**: Would show "0 Results"
3. **After**: Shows actual results with links!

## Troubleshooting

### "No search events found in response"
- **This is normal!** Not every ChatGPT response includes searches
- ChatGPT only searches when it needs external information
- Try asking questions that require current information

### Log shows "debugger attach failed"
- Another debugger might be attached (DevTools)
- Close DevTools and reload the extension

### No events appearing at all
1. Check log for "debugger attached" message
2. Verify you're on https://chatgpt.com (not chat.openai.com)
3. Try the "Hard refresh (tab + panel)" button
4. Check that ChatGPT actually performed a search (look for "Searching the web" message in ChatGPT)

### Events show 0 results but log shows results
- **This shouldn't happen anymore!** This was the bug we fixed
- If you see this, please save the log and report it

## What Success Looks Like

**The fix is working if you see**:
1. ✅ Log messages showing parsed events with result counts
2. ✅ Summary table with non-zero result counts
3. ✅ Events section with actual clickable links
4. ✅ Each query showing its specific results (not all showing the same results)

**Example of a successful session**:
```
Live Log:
[10:35:14] [INFO] Parsing response from .../conversation/abc123
[10:35:14] [INFO] Parsed 4 search events (4 with results, 6 total results)
[10:35:14] [INFO] Event: "Franz Enzenhofer" → 1 results
[10:35:14] [INFO] Event: "Franz Enzenhofer SEO" → 2 results
[10:35:14] [INFO] Event: "Franz Enzenhofer AI" → 2 results
[10:35:14] [INFO] Event: "Franz Enzenhofer Vienna" → 1 results

Summary:
4 queries observed

Events:
[Shows 4 expandable cards, each with different queries and results]
```

## Developer Testing

### Run the test suite:
```bash
npm test
```

### Test with HAR files:
```bash
npx tsx scripts/test-har-parsing.js
```

### Test with bug report data:
```bash
npx tsx scripts/test-bug-report-data.js
```

All should show ✅ with results properly linked!
