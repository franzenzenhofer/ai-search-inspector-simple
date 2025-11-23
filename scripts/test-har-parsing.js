import fs from "node:fs";
import path from "node:path";
import { parseSearchEvents } from "../src/core/parseSearchEvent.js";

const toCapture = (entry) => {
  const responseText = entry.response.content?.text;
  const isBase64 = entry.response.content?.encoding === "base64";
  const responseBody = responseText && isBase64
    ? Buffer.from(responseText, "base64").toString("utf8")
    : responseText;
  return {
    url: entry.request.url,
    method: entry.request.method,
    status: entry.response.status,
    requestBody: entry.request.postData?.text,
    responseBody,
    startedAt: 0,
    completedAt: 0
  };
};

const loadHar = (file) => {
  const content = fs.readFileSync(path.join(process.cwd(), file), "utf8");
  const parsed = JSON.parse(content);
  return parsed.log?.entries ?? [];
};

console.log("\n========================================");
console.log("Testing HAR Parsing with New Logic");
console.log("========================================\n");

const harFiles = [
  "har-file-examples/chatgpt.com-thinking.har",
  "har-file-examples/multipe-searches-chatgpt.com-thinking.har"
];

harFiles.forEach((harFile) => {
  console.log(`\n📁 Testing: ${harFile}`);
  console.log("─".repeat(60));

  const entries = loadHar(harFile);
  console.log(`Total HAR entries: ${entries.length}`);

  const captures = entries.map(toCapture);
  const allEvents = captures.flatMap((capture) => parseSearchEvents(capture));

  console.log(`\n✅ Total raw events found: ${allEvents.length}`);
  allEvents.slice(0, 3).forEach((event, idx) => {
    console.log(`   [${idx + 1}] ${event.method} ${event.url} (${event.rawResponse?.length ?? 0} bytes)`);
  });
  console.log("\n");
});

console.log("========================================");
console.log("Test Complete");
console.log("========================================\n");
