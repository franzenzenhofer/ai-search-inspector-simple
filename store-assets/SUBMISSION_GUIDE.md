# Chrome Web Store Submission Guide
## AI Search Inspector by Franz Enzenhofer

**Complete submission package ready for Chrome Web Store**
**Date Prepared:** November 23, 2025
**Version:** 0.1.0

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Pre-Submission Checklist](#pre-submission-checklist)
3. [Required Assets](#required-assets)
4. [Step-by-Step Submission Process](#step-by-step-submission-process)
5. [Store Listing Information](#store-listing-information)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Post-Submission Steps](#post-submission-steps)

---

## 🚀 QUICK START

**Everything you need is ready!** All assets have been created and organized in the `store-assets/` folder.

**To submit:**
1. Build the extension package: `npm run build`
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay $5 one-time developer registration fee (if not already registered)
4. Click "New Item" and upload `latest-build.zip`
5. Fill in the store listing using the text from `STORE_LISTING_TEXT.md`
6. Upload screenshots and promotional images from `store-assets/`
7. Submit for review

**Estimated review time:** 1-3 business days

---

## ✅ PRE-SUBMISSION CHECKLIST

### Developer Account Setup
- [ ] Chrome Web Store developer account created
- [ ] $5 one-time registration fee paid
- [ ] Publisher email verified
- [ ] Publisher name set (recommend: "Franz Enzenhofer")

### Extension Package
- [ ] Extension builds without errors (`npm run build`)
- [ ] All icon files included in package (16, 32, 48, 128)
- [ ] manifest.json properly configured
- [ ] Extension tested in Chrome (load unpacked)
- [ ] All features working correctly
- [ ] No console errors

### Store Assets Ready
- [ ] 5 screenshots (1280x800) - ✓ Generated
- [ ] Small promotional tile (440x280) - ✓ Generated
- [ ] Marquee promotional tile (1400x560) - ✓ Generated (optional)
- [ ] Store listing text prepared - ✓ Ready
- [ ] Privacy policy published - ✓ Created

### Legal & Compliance
- [ ] Privacy policy URL accessible
- [ ] Extension complies with Chrome Web Store policies
- [ ] No trademark violations
- [ ] Permissions properly justified

---

## 📦 REQUIRED ASSETS

All assets are located in `/store-assets/` directory.

### Extension Package
```
File: latest-build.zip
Location: Project root
Created by: npm run build
Contains: Compiled extension with all icons
```

### Icons (Included in Extension ZIP)
```
✓ icon16.png   (16x16)   - Favicon
✓ icon32.png   (32x32)   - Extension page
✓ icon48.png   (48x48)   - Extensions management
✓ icon128.png  (128x128) - Store listing & installation

Source SVG: store-assets/icons/icon.svg
```

### Screenshots (5 Required - 1280x800)
```
✓ screenshot1-1280x800.png - Side Panel Overview
✓ screenshot2-1280x800.png - Real-time Monitoring
✓ screenshot3-1280x800.png - Structured Results Display
✓ screenshot4-1280x800.png - Table of Contents Navigation
✓ screenshot5-1280x800.png - Raw JSON View

Location: store-assets/screenshots/
```

### Promotional Images
```
✓ small-promo-440x280.png   (440x280) - REQUIRED
✓ marquee-1400x560.png      (1400x560) - OPTIONAL (for featured placement)

Location: store-assets/promotional-images/
```

### Documentation
```
✓ STORE_LISTING_TEXT.md  - All text for store listing
✓ PRIVACY_POLICY.md      - Complete privacy policy
✓ SUBMISSION_GUIDE.md    - This file
✓ README.md              - User documentation

Location: Project root and store-assets/
```

---

## 🎯 STEP-BY-STEP SUBMISSION PROCESS

### Step 1: Build the Extension

```bash
cd /Users/franzenzenhofer/dev/ai-search-inspector-simple
npm run build
```

This creates `latest-build.zip` ready for upload.

### Step 2: Access Developer Dashboard

1. Go to: https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. If first time: Complete developer registration ($5 fee)

### Step 3: Create New Item

1. Click **"New Item"** button
2. Click **"Choose file"** and select `latest-build.zip`
3. Click **"Upload"**
4. Wait for upload to complete

### Step 4: Fill Store Listing - Product Details

Copy from `store-assets/STORE_LISTING_TEXT.md`:

**Extension Name:**
```
AI Search Inspector by Franz Enzenhofer
```

**Description:**
```
[Copy entire "Detailed Description" section from STORE_LISTING_TEXT.md]
```

**Category:**
```
Developer Tools
```

**Language:**
```
English
```

### Step 5: Fill Store Listing - Graphic Assets

**Extension Icon:**
- Already included in your ZIP file (icon128.png)
- Will be automatically extracted

**Screenshots** (Upload all 5):
1. `store-assets/screenshots/screenshot1-1280x800.png`
2. `store-assets/screenshots/screenshot2-1280x800.png`
3. `store-assets/screenshots/screenshot3-1280x800.png`
4. `store-assets/screenshots/screenshot4-1280x800.png`
5. `store-assets/screenshots/screenshot5-1280x800.png`

**Small Promotional Tile** (REQUIRED):
- `store-assets/promotional-images/small-promo-440x280.png`

**Marquee Promotional Tile** (OPTIONAL):
- `store-assets/promotional-images/marquee-1400x560.png`
- Only used if featured on Chrome Web Store homepage

### Step 6: Additional Fields

**Official URL (Homepage):**
```
https://github.com/franzenzenhofer/ai-search-inspector-simple
```

**Support URL:**
```
https://github.com/franzenzenhofer/ai-search-inspector-simple/issues
```

**Privacy Policy:** ⚠️ IMPORTANT
```
https://raw.githubusercontent.com/franzenzenhofer/ai-search-inspector-simple/main/PRIVACY_POLICY.md
```

**Note:** Upload PRIVACY_POLICY.md to GitHub first, then use the raw GitHub URL.

### Step 7: Permissions Justification

Chrome will ask why you need certain permissions. Use these justifications:

**storage:**
```
Required to save captured search data locally in the user's browser. All data is stored on-device only.
```

**tabs:**
```
Required to identify ChatGPT tabs and enable the side panel interface.
```

**scripting:**
```
Required to inject content scripts that monitor network activity on ChatGPT pages.
```

**webRequest:**
```
Required to intercept and capture search queries made by ChatGPT in real-time.
```

**sidePanel:**
```
Required to display the inspector interface in Chrome's side panel.
```

**debugger:**
```
Required to attach to ChatGPT tabs for deep network monitoring and search query capture.
```

**host_permissions (ChatGPT domains):**
```
Required to monitor search activity specifically on ChatGPT websites (chat.openai.com, chatgpt.com). No other sites are accessed.
```

### Step 8: Distribution Settings

**Visibility:**
- [x] Public (recommended)
- [ ] Unlisted
- [ ] Private

**Regions:**
- [x] All regions (recommended)

**Pricing:**
- [x] Free

### Step 9: Review and Submit

1. Click **"Preview"** to see how your listing will appear
2. Review all information carefully
3. Check all screenshots display correctly
4. Verify privacy policy URL is accessible
5. Click **"Submit for Review"**

---

## 📝 STORE LISTING INFORMATION

### Extension Details

| Field | Value |
|-------|-------|
| Name | AI Search Inspector by Franz Enzenhofer |
| Version | 0.1.0 |
| Category | Developer Tools |
| Language | English |
| Price | Free |
| Visibility | Public |

### Search Keywords (Max 5)
```
1. chatgpt
2. search inspector
3. ai search
4. web search monitor
5. developer tools
```

### Short Description (Max 132 chars)
```
Inspect ChatGPT outbound search queries and their returned results in a compact side panel.
```
(93 characters)

### Publisher Information
```
Publisher Name: Franz Enzenhofer
Support Email: [Your support email]
Website: https://github.com/franzenzenhofer/ai-search-inspector-simple
```

---

## ⚠️ COMMON ISSUES AND SOLUTIONS

### Issue: "Privacy policy URL not accessible"
**Solution:**
- Push PRIVACY_POLICY.md to GitHub main branch first
- Use raw GitHub URL: `https://raw.githubusercontent.com/[username]/[repo]/main/PRIVACY_POLICY.md`
- Test URL in browser before submitting

### Issue: "Screenshots are blurry"
**Solution:**
- All screenshots are generated at exactly 1280x800
- Do not resize or compress them
- Upload the files from `store-assets/screenshots/` directly

### Issue: "Icon appears pixelated"
**Solution:**
- Ensure icon128.png is included in the extension ZIP
- Don't manually upload icon separately
- Chrome extracts it automatically from the package

### Issue: "Permissions seem excessive"
**Solution:**
- All permissions are required for core functionality
- Use the justifications provided in Step 7
- The extension genuinely needs debugger permission for network monitoring

### Issue: "Detailed description too long"
**Solution:**
- Current description is well under 16,000 character limit
- If needed, remove some emoji or decorative lines
- Keep core feature descriptions intact

### Issue: "Promotional tile rejected"
**Solution:**
- Images are AI-generated and may need adjustment
- Ensure they accurately represent the extension
- If rejected, can submit without marquee tile (it's optional)

---

## 🎉 POST-SUBMISSION STEPS

### Immediately After Submission

1. **Note submission date and time**
   - Review typically takes 1-3 business days
   - Can take up to 7 days during high-volume periods

2. **Monitor email for updates**
   - Chrome will email the publisher account
   - Check spam folder

3. **Check developer dashboard**
   - Visit dashboard daily for status updates
   - Status will show: "Pending review" → "In review" → "Published" or "Rejected"

### If Approved

1. **Verify listing**
   - Visit your extension's store page
   - Check all information displays correctly
   - Test installation from store

2. **Share the extension**
   - Copy the Chrome Web Store URL
   - Share on social media, website, GitHub README

3. **Monitor reviews and ratings**
   - Respond to user reviews promptly
   - Address issues and bugs reported

4. **Plan updates**
   - Gather user feedback
   - Plan feature enhancements
   - Maintain regular updates

### If Rejected

1. **Review rejection reason carefully**
   - Chrome will specify exactly what needs to be fixed
   - Common reasons: privacy policy, permissions, misleading descriptions

2. **Make required changes**
   - Fix issues mentioned in rejection
   - Update assets if needed
   - Rebuild extension if code changes needed

3. **Resubmit**
   - Address all rejection points
   - Include notes about changes made
   - Submit again

---

## 📊 SUBMISSION CHECKLIST - FINAL REVIEW

### Before Clicking "Submit"

#### Extension Package
- [ ] Built with `npm run build`
- [ ] Tested locally (works perfectly)
- [ ] All icons included
- [ ] manifest.json correct
- [ ] No errors in console

#### Store Listing
- [ ] Extension name: "AI Search Inspector by Franz Enzenhofer"
- [ ] Description copied from STORE_LISTING_TEXT.md
- [ ] Category: Developer Tools
- [ ] Language: English
- [ ] Keywords entered (max 5)

#### Graphics
- [ ] 5 screenshots uploaded (1280x800)
- [ ] Small promo tile uploaded (440x280)
- [ ] Marquee tile uploaded (1400x560) - optional
- [ ] All images display correctly in preview

#### Links
- [ ] Privacy policy URL working
- [ ] Support URL working
- [ ] Homepage URL working
- [ ] All URLs use HTTPS

#### Permissions
- [ ] All permissions justified
- [ ] Explanations clear and accurate
- [ ] No unnecessary permissions

#### Legal
- [ ] Privacy policy complies with requirements
- [ ] No trademark violations
- [ ] Disclaimer about OpenAI included
- [ ] Terms of service (if applicable)

#### Final Checks
- [ ] Preview listing looks professional
- [ ] No typos or grammatical errors
- [ ] Contact information correct
- [ ] Publisher name set

---

## 🔗 USEFUL LINKS

- **Chrome Web Store Developer Dashboard:** https://chrome.google.com/webstore/devconsole
- **Chrome Web Store Policies:** https://developer.chrome.com/docs/webstore/program-policies/
- **Publishing Guide:** https://developer.chrome.com/docs/webstore/publish/
- **Image Guidelines:** https://developer.chrome.com/docs/webstore/images/
- **Branding Guidelines:** https://developer.chrome.com/docs/webstore/branding/

---

## 📞 SUPPORT

If you encounter issues during submission:

1. **Chrome Web Store Help:**
   - https://support.google.com/chrome_webstore/

2. **Developer Forum:**
   - https://groups.google.com/a/chromium.org/g/chromium-extensions

3. **Extension Developer:**
   - GitHub: https://github.com/franzenzenhofer/ai-search-inspector-simple/issues

---

## ✨ SUCCESS METRICS

After publication, monitor these metrics in the Developer Dashboard:

- **Installations:** Total number of users
- **Active Users:** Daily/Weekly/Monthly active users
- **Ratings:** Average star rating
- **Reviews:** User feedback
- **Impressions:** Store listing views
- **Conversion Rate:** Views to installs

---

## 🎯 TIMELINE

| Phase | Duration | Notes |
|-------|----------|-------|
| Submission | 15-30 min | Upload and fill forms |
| Review | 1-3 days | Automated + manual review |
| Publication | Instant | Live immediately after approval |
| Indexing | 1-2 hours | Searchable in store |

---

## 🏆 CONGRATULATIONS!

You now have everything needed for a successful Chrome Web Store submission!

**All assets are ready:**
- ✓ Extension built and tested
- ✓ Icons created in all sizes
- ✓ Screenshots professionally designed
- ✓ Promotional images generated
- ✓ Store listing text written
- ✓ Privacy policy created
- ✓ Documentation complete

**Next step:** Click "New Item" in the Chrome Web Store Developer Dashboard!

---

**Last Updated:** November 23, 2025
**Prepared by:** Claude Code
**For:** Franz Enzenhofer

Good luck with your submission! 🚀
