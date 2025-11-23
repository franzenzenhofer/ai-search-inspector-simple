import fs from "node:fs";
import { parseSearchEvents } from "../src/core/parseSearchEvent.js";

console.log("\n========================================");
console.log("Testing Bug Report Data");
console.log("========================================\n");

// Read the bug report file
const bugReportData = fs.readFileSync("everything-from-the-sidebar.md", "utf8");

// Extract the JSON from the raw response
const jsonMatch = bugReportData.match(/RAW RESPONSE.*?\n(\{[\s\S]*?\n)\s*Request:/);
if (!jsonMatch) {
  console.log("❌ Could not extract JSON from bug report");
  process.exit(1);
}

const responseBody = jsonMatch[1].trim();

const capture = {
  url: "https://chatgpt.com/backend-api/conversation/6921cc0e-aa2c-8326-9008-189174d9106e",
  method: "GET",
  status: 200,
  requestBody: undefined,
  responseBody: responseBody,
  startedAt: Date.now(),
  completedAt: Date.now()
};

const events = parseSearchEvents(capture);

console.log("✨ NEW PARSER RESULTS:");
console.log("─".repeat(60));
console.log(`Total raw events found: ${events.length}`);
events.forEach((event, idx) => console.log(`[${idx + 1}] ${event.method} ${event.url} (${event.rawResponse?.length ?? 0} bytes)`));

console.log("\n========================================\n");
