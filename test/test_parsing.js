/* global describe, it */
"use strict";

let colonParse = require("../");
let path = require("path");
let assert = require("assert");

let fixturesDir = path.resolve(__dirname, "fixtures");

let assertSame = assert.strictEqual;

describe("parsing", _ => {
	it("should separate headers from body", () => {
		let filepath = fixture("sample.tid");
		return colonParse(filepath).
			then(({ headers, body }) => {
				let sep = token();
				assertSame(Object.keys(headers).join(sep),
						["title", "format"].join(sep));
				assertSame(headers.title, "Hello World");
				assertSame(headers.format, "txt");
				assertSame(body, `
lorem ipsum
dolor sit amet

consectetur adipisicing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua

* foo
* bar
* baz

ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
				`.trim());
			});
	});

	it("should trim leading and trailing whitespace", () => {
		let filepath = fixture("front_matter.tid");
		return colonParse(filepath).
			then(({ headers, body }) => {
				let sep = token();
				assertSame(Object.keys(headers).join(sep),
						["hello", "bar"].join(sep));
				assertSame(headers.hello, "foo");
				assertSame(headers.bar, "world");
				assertSame(body, "lorem\n  ipsum");
			});
	});

	it("should optionally forego trimming whitespace", () => {
		let filepath = fixture("front_matter.tid");
		return colonParse(filepath, { trim: false }).
			then(({ headers, body }) => {
				let sep = token();
				assertSame(Object.keys(headers).join(sep),
						["hello ", "bar   "].join(sep));
				assertSame(headers["hello "], " foo    ");
				assertSame(headers["bar   "], " world  ");
				assertSame(body, "  lorem\n  ipsum  ");
			});
	});

	it("should balk at invalid headers", () => {
		let filepath = fixture("invalid.tid");
		return colonParse(filepath).
			then(_ => {
				assert(false, "should have failed");
			}, err => {
				let fn = _ => { throw err; };
				assert.throws(fn, /invalid header/);
			});
	});

	it("should balk at missing headers", () => {
		let filepath = fixture("plain.txt");
		return colonParse(filepath).
			then(_ => {
				assert(false, "should have failed");
			}, err => {
				let fn = _ => { throw err; };
				assert.throws(fn, /invalid header/);
			});
	});
});

function fixture(filepath) {
	return path.resolve(fixturesDir, filepath);
}

// adapted from https://stackoverflow.com/a/105074
function token() {
	let id = Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
	return `<${id}>`;
}
