import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchResource } from "./cache";

interface Payload {
  value: string;
}

function isPayload(value: unknown): value is Payload {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof value.value === "string"
  );
}

describe("fetchResource", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("validates and caches a successful API response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ value: "live" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(fetchResource("sample", "/sample", isPayload)).resolves.toEqual({
      data: { value: "live" },
      source: "network",
    });
    expect(localStorage.getItem("moshafk:v1:sample")).toContain('"value":"live"');
  });

  it("uses validated cached content when the API is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    localStorage.setItem(
      "moshafk:v1:sample",
      JSON.stringify({ savedAt: 0, data: { value: "cached" } }),
    );

    await expect(fetchResource("sample", "/sample", isPayload)).resolves.toEqual({
      data: { value: "cached" },
      source: "cache",
    });
  });

  it("does not serve malformed responses or invalid cache records", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ value: 4 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    localStorage.setItem("moshafk:v1:sample", JSON.stringify({ savedAt: 0, data: { value: 4 } }));

    await expect(fetchResource("sample", "/sample", isPayload)).rejects.toThrow(
      "unexpected response",
    );
  });
});
