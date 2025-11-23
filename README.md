# AI Search Inspector

A Chrome extension that inspects and displays **ChatGPT** outbound search queries and their returned results in a compact side panel.

> **Currently supports:** ChatGPT (chat.openai.com and chatgpt.com)

## Features

- **Real-time Search Monitoring**: Automatically captures all search queries made by ChatGPT
- **Structured Display**: Shows search results in an organized, hierarchical format
- **Table of Contents**: Quick navigation to specific events and queries
- **Copy Functionality**: Copy individual results or all data with visual feedback
- **Raw JSON View**: Inspect the complete raw JSON responses
- **Word-wrap Protection**: Properly formatted display that prevents content overflow

## Installation

### Option 1: Install from Pre-built ZIP (Recommended)

1. **Download the Extension**
   - Download the [latest-build.zip](./latest-build.zip) file from this repository
   - Extract the ZIP file to a location on your computer

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click the three-dot menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select the extracted folder (should contain `manifest.json`)
   - Click "Select Folder"

5. **Verify Installation**
   - The extension should now appear in your extensions list
   - You should see "AI Search Inspector" with version 0.1.0

### Option 2: Build from Source

**Prerequisites:**
- Node.js (v18 or higher)
- npm (v9 or higher)

**Steps:**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/franzenzenhofer/ai-search-inspector-simple.git
   cd ai-search-inspector-simple
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   npm run build
   ```
   This will:
   - Clean the `dist` folder
   - Compile TypeScript files
   - Bundle the extension
   - Create `latest-build.zip` in the project root

4. **Load in Chrome**
   - Follow steps 2-5 from Option 1 above
   - Select the `dist` folder (not the project root)

## Usage

1. **Open ChatGPT**
   - Navigate to https://chat.openai.com or https://chatgpt.com

2. **Open the Side Panel**
   - Click the extension icon in the Chrome toolbar
   - The side panel will open showing "AI Search Inspector"

3. **Interact with ChatGPT**
   - Ask ChatGPT questions that require web searches
   - The extension will automatically capture and display all search queries and results

4. **View Results**
   - Use the Table of Contents to navigate between events and queries
   - Click on individual results to see details
   - Click "Show Raw JSON" to see the complete JSON response
   - Click "Copy" on any result to copy it to clipboard
   - Click "Copy All" to copy all structured data

5. **Refresh**
   - Click "Hard refresh (tab + panel)" to reload both the ChatGPT tab and the panel

## Development

### Project Structure

```
ai-search-inspector-simple/
├── src/
│   ├── core/           # Core types and parsing logic
│   ├── infra/          # Service worker and content scripts
│   └── ui/             # Side panel UI
├── dist/               # Built extension (generated)
├── manifest.json       # Extension manifest
├── sidepanel.html      # Side panel HTML
├── package.json        # Node.js configuration
└── tsconfig.json       # TypeScript configuration
```

### Available Scripts

- `npm run build` - Build the extension and create zip file
- `npm run clean` - Remove dist folder
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests

### Build Process

The build process uses esbuild to bundle TypeScript files:

1. `build:sw` - Bundles the service worker
2. `build:content` - Bundles the content script
3. `build:panel` - Bundles the side panel UI
4. `copy` - Copies manifest and HTML files
5. `zip` - Creates latest-build.zip

## Permissions

The extension requires the following permissions:

- **storage**: Store captured search data
- **tabs**: Access tab information
- **scripting**: Inject content scripts
- **webRequest**: Monitor network requests
- **sidePanel**: Display the side panel
- **debugger**: Attach to ChatGPT tabs for network monitoring

**Host Permissions:**
- `https://chat.openai.com/*`
- `https://chatgpt.com/*`
- `https://*.openai.com/*`

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Data is cleared when you clear Chrome extension storage

## Troubleshooting

### Extension Not Capturing Data

1. Make sure you're on https://chat.openai.com or https://chatgpt.com
2. Try clicking "Hard refresh" in the side panel
3. Reload the extension from chrome://extensions/

### Side Panel Not Opening

1. Click the extension icon in the toolbar
2. Check if the extension is enabled in chrome://extensions/
3. Try reloading the extension

### Build Errors

1. Make sure you have Node.js v18+ and npm v9+
2. Delete `node_modules` and run `npm install` again
3. Delete `dist` and run `npm run build` again

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Created with Claude Code

## Changelog

### v0.1.0 (Current)
- Initial release
- Search query monitoring
- Structured result display
- Table of contents navigation
- Copy functionality with visual feedback
- Raw JSON view
- Word-wrap protection
