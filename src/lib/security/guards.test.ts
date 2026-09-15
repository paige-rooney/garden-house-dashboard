import { describe, expect, it } from "vitest";
import { assertAllowedUpload, sanitizeFileName, buildObjectKey } from "@/lib/files";
import { buildRevenueFromPayments } from "@/lib/revenue";
import { mergeContractBody } from "@/lib/contracts/merge";
import { normalizeSignToken } from "@/lib/contracts/sign-token";
import { allowedOrigins, assertSameOrigin, HttpError, publicAppOrigin } from "@/lib/http";

describe("file helpers", () => {
  it("sanitizes names and rejects path traversal", () => {
    expect(sanitizeFileName("../secret.pdf")).toBe("secret.pdf");
    expect(sanitizeFileName("My Mix (final).wav")).toBe("My-Mix-final-.wav");
  });

  it("rejects disallowed mime types", () => {
    expect(() => assertAllowedUpload({ mimeType: "application/x-msdownload", byteSize: 10 })).toThrow();
  });

  it("namespaces object keys by environment and project", () => {
    const key = buildObjectKey({
      environment: "development",
      purpose: "project",
      clientId: "client-1",
      projectId: "project-1",
      fileName: "demo.wav",
    });
    expect(key.startsWith("development/project/client-1/project-1/")).toBe(true);
    expect(key.includes("..")).toBe(false);
  });
});

describe("revenue", () => {
  it("uses paid payments only, not due invoices", () => {
    const points = buildRevenueFromPayments(
      [
        { amountUsd: 100, status: "paid", paidAt: `${new Date().getFullYear()}-01-15` },
        { amountUsd: 999, status: "failed", paidAt: `${new Date().getFullYear()}-01-16` },
        { amountUsd: 50, status: "pending", paidAt: `${new Date().getFullYear()}-01-17` },
      ],
      new Date().getFullYear(),
    );
    expect(points[0].monthly).toBe(100);
  });
});

describe("contracts", () => {
  it("merges client email into the body", () => {
    const body = mergeContractBody("Hello {{client_name}} at {{client_email}}", {
      client_name: "Maya",
      client_email: "maya@example.com",
    });
    expect(body).toContain("maya@example.com");
  });

  it("normalizes copied signing tokens", () => {
    expect(normalizeSignToken("  abcdef1234  ")).toBe("abcdef1234");
    expect(normalizeSignToken(["abc123xyz0"])).toBe("abc123xyz0");
    expect(normalizeSignToken("token/")).toBe("token");
  });
});

describe("csrf origins", () => {
  it("allows local development origins", () => {
    const origins = allowedOrigins();
    expect(origins.has("http://localhost:3000") || origins.has("http://127.0.0.1:3000")).toBe(true);
  });

  it("allows the current Vercel deployment and branch URLs", () => {
    const previousUrl = process.env.VERCEL_URL;
    const previousBranch = process.env.VERCEL_BRANCH_URL;
    process.env.VERCEL_URL = "garden-house-dashboard-abc123.vercel.app";
    process.env.VERCEL_BRANCH_URL =
      "garden-house-dashboard-git-cursor-3a01da-paige-rooneys-projects.vercel.app";
    try {
      const origins = allowedOrigins();
      expect(origins.has("https://garden-house-dashboard-abc123.vercel.app")).toBe(true);
      expect(
        origins.has("https://garden-house-dashboard-git-cursor-3a01da-paige-rooneys-projects.vercel.app"),
      ).toBe(true);
    } finally {
      if (previousUrl === undefined) delete process.env.VERCEL_URL;
      else process.env.VERCEL_URL = previousUrl;
      if (previousBranch === undefined) delete process.env.VERCEL_BRANCH_URL;
      else process.env.VERCEL_BRANCH_URL = previousBranch;
    }
  });

  it("allows mutating requests from the same preview host", () => {
    const origin = "https://garden-house-dashboard-git-cursor-3a01da-paige-rooneys-projects.vercel.app";
    const request = new Request(`${origin}/api/files`, {
      method: "POST",
      headers: { origin },
    });
    expect(() => assertSameOrigin(request)).not.toThrow();
  });

  it("rejects mutating requests from another site", () => {
    const request = new Request(
      "https://garden-house-dashboard-git-cursor-3a01da-paige-rooneys-projects.vercel.app/api/files",
      {
        method: "POST",
        headers: { origin: "https://evil.example" },
      },
    );
    expect(() => assertSameOrigin(request)).toThrow(HttpError);
    expect(() => assertSameOrigin(request)).toThrow(/Garden House site/);
  });

  it("builds public links from the request host", () => {
    const request = new Request(
      "https://garden-house-dashboard-git-cursor-3a01da-paige-rooneys-projects.vercel.app/api/contracts/send",
      { method: "POST" },
    );
    expect(publicAppOrigin(request)).toBe(
      "https://garden-house-dashboard-git-cursor-3a01da-paige-rooneys-projects.vercel.app",
    );
  });
});
