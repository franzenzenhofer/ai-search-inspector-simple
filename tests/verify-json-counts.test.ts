/**
 * Verification test for JSON parsing counts.
 * Uses the ACTUAL parsing and stats logic from the codebase - no duplication.
 * Validates that domain counts match URL counts for consistency.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "fs";
import { parseSearchEvents, RawCapture } from "../src/core/parseSearchEvent";
import { buildStats, rootDomain } from "../src/core/stats";

const JSON_PATH = "./test-data.json";

const loadTestData = (): RawCapture | undefined => {
  if (!existsSync(JSON_PATH)) return undefined;
  const data = readFileSync(JSON_PATH, "utf-8");
  return { url: "https://chatgpt.com/backend-api/conversation", method: "POST", status: 200, responseBody: data, startedAt: 0, completedAt: 0 };
};

describe("JSON counts verification (uses actual parsing logic)", () => {
  const capture = loadTestData();

  it.skipIf(!capture)("parses all events from test data", () => {
    const events = parseSearchEvents(capture!);
    expect(events.length).toBeGreaterThanOrEqual(1);
    console.log(`Events parsed: ${events.length}`);
    events.forEach((e, i) => console.log(`  Event ${i + 1}: "${e.query}" with ${e.resultCount} results`));
  });

  it.skipIf(!capture)("buildStats domain count matches URL domain count", () => {
    const events = parseSearchEvents(capture!);
    const stats = buildStats(events);

    // Parse domain counts from stats.domains (format: "domain.com (5x)")
    const domainCounts = new Map<string, number>();
    stats.domains.forEach((d) => {
      const match = d.match(/^(.+) \((\d+)x\)$/);
      if (match) domainCounts.set(match[1], parseInt(match[2], 10));
    });

    // Sum URL counts by domain using the SAME rootDomain function from stats.ts
    const urlDomainCounts = new Map<string, number>();
    stats.urls.forEach(({ url, count }) => {
      const domain = rootDomain(url);
      if (domain) urlDomainCounts.set(domain, (urlDomainCounts.get(domain) ?? 0) + count);
    });

    console.log("\n=== Domain counts (from stats.domains) ===");
    domainCounts.forEach((count, domain) => console.log(`  ${domain}: ${count}x`));

    console.log("\n=== Domain counts (summed from stats.urls) ===");
    urlDomainCounts.forEach((count, domain) => console.log(`  ${domain}: ${count}x`));

    // Find discrepancies
    const discrepancies: string[] = [];
    domainCounts.forEach((count, domain) => {
      const urlCount = urlDomainCounts.get(domain) ?? 0;
      if (count !== urlCount) {
        discrepancies.push(`${domain}: domains=${count}x, urls=${urlCount}x`);
      }
    });

    if (discrepancies.length > 0) {
      console.log("\n=== DISCREPANCIES ===");
      discrepancies.forEach((d) => console.log(`  ${d}`));
    }

    expect(discrepancies).toEqual([]);
  });

  it.skipIf(!capture)("logs detailed worldpopulationreview.com analysis", () => {
    const events = parseSearchEvents(capture!);
    const stats = buildStats(events);

    const wprDomain = stats.domains.find((d) => d.includes("worldpopulationreview"));
    const wprUrls = stats.urls.filter(({ url }) => url.includes("worldpopulationreview"));

    console.log("\n=== worldpopulationreview.com analysis ===");
    console.log(`Domain entry: ${wprDomain ?? "not found"}`);
    console.log(`URL entries (${wprUrls.length}):`);
    wprUrls.forEach(({ url, count }) => console.log(`  ${count}x - ${url}`));

    const urlSum = wprUrls.reduce((sum, { count }) => sum + count, 0);
    const domainMatch = wprDomain?.match(/\((\d+)x\)$/);
    const domainCount = domainMatch ? parseInt(domainMatch[1], 10) : 0;

    console.log(`\nURL count sum: ${urlSum}, Domain count: ${domainCount}`);
    expect(urlSum).toBe(domainCount);
  });
});
