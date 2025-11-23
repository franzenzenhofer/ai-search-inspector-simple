# Privacy Policy for AI Search Inspector by Franz Enzenhofer

**Last Updated:** November 23, 2025
**Effective Date:** November 23, 2025
**Version:** 1.0

## Overview

AI Search Inspector by Franz Enzenhofer ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how we handle data when you use our Chrome extension.

## Short Version (TL;DR)

**We do not collect, store, transmit, or share any of your personal data.** All data captured by the extension stays on your local device. We have no servers, no analytics, no tracking, and no data collection of any kind.

## Data Collection and Usage

### What Data Does the Extension Access?

The Extension monitors network requests on ChatGPT websites (chat.openai.com, chatgpt.com) to capture:
- Search queries made by ChatGPT
- Search results returned from the web
- API response data from ChatGPT's search functionality
- Timestamps of search events

### Where Is This Data Stored?

**All data is stored exclusively in your local browser storage** using Chrome's built-in storage APIs. This data:
- Never leaves your computer
- Is not transmitted to any external servers
- Is not accessible to the extension developer
- Is not shared with any third parties
- Can be cleared at any time through Chrome's extension settings

### What Data Do We Collect From Users?

**None.** We do not collect any data from users. We have:
- No analytics or tracking systems
- No error reporting to external servers
- No user accounts or authentication
- No cookies or tracking pixels
- No third-party integrations that collect data

## Permissions Explanation

The Extension requests the following permissions. Here's exactly why each is needed:

### storage
**Why:** To save captured search data locally in your browser
**What it accesses:** Only the extension's own storage space in Chrome
**Data handling:** Stored locally, never transmitted

### tabs
**Why:** To identify ChatGPT tabs and enable the side panel
**What it accesses:** Tab URLs to detect ChatGPT pages
**Data handling:** Only used for tab detection, not collected or stored

### scripting
**Why:** To inject content scripts that monitor network activity
**What it accesses:** ChatGPT web pages only
**Data handling:** No data collection, only monitoring setup

### webRequest
**Why:** To intercept and capture search queries in real-time
**What it accesses:** Network requests on ChatGPT domains only
**Data handling:** Captured data stored locally, never transmitted

### sidePanel
**Why:** To display the inspector interface
**What it accesses:** Side panel UI only
**Data handling:** Display only, no data collection

### debugger
**Why:** To attach to ChatGPT tabs for deep network monitoring
**What it accesses:** Network activity on ChatGPT pages
**Data handling:** Used for monitoring only, data stored locally

### Host Permissions (https://chat.openai.com/*, https://chatgpt.com/*, https://*.openai.com/*)
**Why:** To monitor search activity specifically on ChatGPT websites
**What it accesses:** Only these specific domains
**Data handling:** Monitoring only, no external transmission

## Third-Party Services

**We use no third-party services.** The Extension:
- Does not connect to any external servers
- Does not use any analytics services (no Google Analytics, etc.)
- Does not integrate with any third-party APIs
- Does not load any external scripts or resources

## Data Sharing and Disclosure

**We do not share any data because we do not collect any data.**

The Extension:
- Does not sell data to third parties
- Does not share data with advertisers
- Does not provide data to analytics companies
- Has no data to provide to law enforcement (all data is local to your device)

## Data Retention

All captured data is stored in your local browser storage indefinitely until you:
- Clear the extension data through Chrome settings
- Uninstall the extension (which automatically clears its data)
- Manually clear Chrome's extension storage

The extension developer has no access to this data and cannot retain or delete it.

## Children's Privacy

The Extension does not knowingly collect any data from anyone, including children under 13. Since we collect no data at all, there are no special considerations for children's data.

## International Data Transfers

Since all data is stored locally on your device, there are no international data transfers of any kind.

## Your Rights

You have complete control over your data:
- **Access:** All data is visible in the extension's side panel
- **Export:** Use the "Copy All" feature to export your data
- **Delete:** Clear data through Chrome extension settings or by uninstalling
- **Control:** All data stays on your device under your control

## Security

Your data security is ensured by:
- **Local Storage:** All data stays on your device
- **No Transmission:** Data never sent over the internet
- **No Servers:** We have no servers that could be breached
- **Chrome Security:** Protected by Chrome's extension sandboxing

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be posted:
- In the extension's GitHub repository
- On the Chrome Web Store listing
- In the extension's documentation

Continued use of the Extension after changes constitutes acceptance of the updated policy.

## Open Source

The Extension is open source. You can review the complete source code at:
https://github.com/franzenzenhofer/ai-search-inspector-simple

This transparency allows you to verify that we handle data exactly as described in this policy.

## Contact

If you have questions about this Privacy Policy or the Extension's data handling:

- **GitHub Issues:** https://github.com/franzenzenhofer/ai-search-inspector-simple/issues
- **Developer:** Franz Enzenhofer

## Compliance

This Privacy Policy is designed to comply with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Other applicable privacy regulations

However, since we collect no personal data, most regulatory requirements do not apply.

## Disclaimer

This Extension is not affiliated with, endorsed by, or sponsored by OpenAI. "ChatGPT" is a trademark of OpenAI. The Extension simply monitors publicly visible network activity when you use ChatGPT.

---

## Summary

**What we collect:** Nothing
**What we store remotely:** Nothing
**What we share:** Nothing
**What stays local:** Everything the extension captures
**Your control:** Complete

By using AI Search Inspector by Franz Enzenhofer, you acknowledge that you have read and understood this Privacy Policy.

---

**Last Updated:** November 23, 2025
**Version:** 1.0
