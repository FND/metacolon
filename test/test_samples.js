import { parseHeaders } from "../src/core.js";
import { bytes2strings, ENCODER } from "./util.js";
import { test } from "node:test";
import assert, { deepStrictEqual as assertDeep } from "node:assert";

test("typical sample", () => {
	let txt = `
title: Hello World
format: txt

lorem ipsum
dolor sit amet

consectetur adipisicing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua

* foo
* bar
* baz

ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
	`.trim() + "\n";
	let res = parseHeaders(ENCODER.encode(txt), true);
	let headers = bytes2strings(res);
	let body = headers.pop();
	// deno-fmt-ignore
	assertDeep(headers, [
		"title", "Hello World",
		"format", "txt",
	]);
	assert(body.startsWith("lorem ipsum\ndolor sit amet\n\nconsectetur"));
	// deno-fmt-ignore
	assert(body.endsWith(`
* baz

ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
	`.trim() + "\n"));
});

test("typical front matter", () => {
	let txt = "hello : foo    \nbar   : world  \n\nlorem\nipsum  \n";
	let res = parseHeaders(ENCODER.encode(txt), true);
	// deno-fmt-ignore
	assertDeep(bytes2strings(res), [
		"hello ", "foo    ",
		"bar   ", "world  ",
		"lorem\nipsum  \n",
	]);
});

test("stringly typed front matter", () => {
	let txt = `
foo: bar
count: 123
safe: True

lorem ipsum dolor sit amet
	`.trim();
	let res = parseHeaders(ENCODER.encode(txt), true);
	// deno-fmt-ignore
	assertDeep(bytes2strings(res), [
		"foo", "bar",
		"count", "123",
		"safe", "True",
		"lorem ipsum dolor sit amet",
	]);
});
