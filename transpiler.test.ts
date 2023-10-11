#!/usr/bin/env -S deno test -A --no-check

import { Context, Hono } from "https://deno.land/x/hono@v3.7.5/mod.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { transpiler } from "./transpiler.ts";

// Simple testing based on tests for Pretty JON
// See https://github.com/honojs/hono/blob/main/src/middleware/pretty-json/index.test.ts

const TS = "function add(a: number, b: number) { return a + b; }";
const PRAGMA = "/** @jsx h */ ";
const TSX = PRAGMA + "export function App() { return (<span>Hello</span>); }";

Deno.test("Expect Transpiled Javascript", async function () {
  const app = new Hono();
  app.use("*", transpiler());
  app.get("/file.ts", (c: Context) => c.text(TS));

  // Request a Typescript page first
  const res = await app.request("http://localhost/file.ts");
  assertExists(res);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "function add(a, b) {\n  return a + b;\n}\n");
});

Deno.test("Expect Untouched Content", async function () {
  const app = new Hono();
  app.use("*", transpiler());

  // Clearly wrong (note the JS below), but should be untouched
  app.get("/file.js", (c: Context) => c.text(TS));

  // Request a Typescript page first
  const res = await app.request("http://localhost/file.js");
  assertExists(res);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), TS);
});

Deno.test("Expect Untouched Content for Wrong TS", async function () {
  const app = new Hono();
  app.use("*", transpiler());

  // Wrong TS will be sent verbatim
  const bad = "function { !!! !@#$ add(a: INT) return a + b + c; }";
  app.get("/file.ts", (c: Context) => c.text(bad));

  // Request a Typescript page first
  const res = await app.request("http://localhost/file.ts");
  assertExists(res);
  assertEquals(res.status, 500);
  assertEquals(await res.text(), bad);
});

// NOTE: this unfortunately doesn't work yet, will watch PR below for inclusion
// https://github.com/denoland/deno_emit/pull/139
Deno.test.ignore("Expect Transpiled TSX", async function () {
  const app = new Hono();
  app.use("*", transpiler());
  app.get("/file.tsx", (c: Context) => c.text(TSX));

  // Request a Typescript page first
  const res = await app.request("http://localhost/file.tsx");
  assertExists(res);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "... TBD ...");
});
