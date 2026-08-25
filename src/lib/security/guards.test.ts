import { describe, expect, it } from "vitest";
import { assertAllowedUpload, sanitizeFileName, buildObjectKey } from "@/lib/files";
import { buildRevenueFromPayments } from "@/lib/revenue";
import { mergeContractBody } from "@/lib/contracts/merge";
import { allowedOrigins } from "@/lib/http";

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
});

describe("csrf origins", () => {
  it("allows local development origins", () => {
    const origins = allowedOrigins();
    expect(origins.has("http://localhost:3000") || origins.has("http://127.0.0.1:3000")).toBe(true);
  });
});
