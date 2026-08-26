import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Vercel serves the Vite client build", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));

  assert.equal(config.framework, "vite");
  assert.equal(config.buildCommand, "npm run build");
  assert.equal(config.outputDirectory, "dist/client");
  await access(new URL("dist/client/index.html", root));
});

test("Vercel configuration keeps SPA navigation and security headers", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));
  const headers = Object.fromEntries(
    config.headers.flatMap((rule) => rule.headers).map(({ key, value }) => [key, value]),
  );

  assert.ok(config.rewrites.some(({ destination }) => destination === "/index.html"));
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
});

test("Vercel Git integration does not deploy automatically", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));

  assert.equal(config.git?.deploymentEnabled, false);
});
