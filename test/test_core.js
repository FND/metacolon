import { parseHeaders } from "../src/core.js";
import { bytes2strings, ENCODER } from "./util.js";
import { test } from "node:test";
import assert, {
	deepStrictEqual as assertDeep,
	strictEqual as assertSame,
} from "node:assert";

let TXT = `
foo: lorem ipsum
bar:dolor sit amet
bäz: lörem: ipßüm
:  …
… : doļœr sït ämét
`.trim() + "\nalpha: \nomega:";
TXT = ENCODER.encode(TXT);

test("turns RFC 822-style text into headers (key-value pairs) with trailing body", () => {
	let res = parseHeaders(TXT);
	assertSame(typeof res[Symbol.iterator], "function");
	// deno-fmt-ignore
	assertDeep(bytes2strings(res), [
		"foo", " lorem ipsum",
		"bar", "dolor sit amet",
		"bäz", " lörem: ipßüm",
		"", "  …",
		"… ", " doļœr sït ämét",
		"alpha", " ",
		"omega", "",
		"",
	]);
});

test("supports trimming space suffix in field separator", () => {
	let res = parseHeaders(TXT, true);
	// deno-fmt-ignore
	assertDeep(bytes2strings(res), [
		"foo", "lorem ipsum",
		"bar", "dolor sit amet",
		"bäz", "lörem: ipßüm",
		"", " …",
		"… ", "doļœr sït ämét",
		"alpha", "",
		"omega", "",
		"",
	]);
});

test("emits body", () => {
	let txt = `
foo: hello
bar: world

lorem ipsum
dolor sit amet

lörem ipßüm doļœr sït ämét
	`.trim();
	let res = parseHeaders(ENCODER.encode(txt), true);
	// deno-fmt-ignore
	assertDeep(bytes2strings(res), [
		"foo", "hello",
		"bar", "world",
		`
lorem ipsum
dolor sit amet

lörem ipßüm doļœr sït ämét
		`.trim(),
	]);
});

test("balks at invalid headers", () => {
	let samples = [
		"foo: bar\nlorem ipsum",
		`
foo: bar
lorem ipsum

dolor sit amet
		`.trim(),
	];
	for (let txt of samples) {
		let res = parseHeaders(ENCODER.encode(txt), true);
		assert.throws(() => {
			[...res];
		}, /invalid header: lorem ipsum/);
	}
});

test("balks at missing headers", () => {
	let txt = `
lorem ipsum
dolor sit amet

lörem ipßüm doļœr sït ämét
	`.trim();
	let res = parseHeaders(ENCODER.encode(txt), true);
	assert.throws(() => {
		res.next();
	}, /missing RFC 822-style headers/);
});
