import { parseHeaders } from "../src/core.js";
import { bytes2strings, ENCODER, toInserted } from "./util.js";
import { test } from "node:test";
import assert, {
	deepStrictEqual as assertDeep,
	strictEqual as assertSame,
} from "node:assert";

// deno-fmt-ignore
let TXT = ENCODER.encode(`
foo: lorem ipsum
bar:dolor sit amet
bäz: lörem: ipßüm
:  …
… : doļœr sït ämét
`.trim() + "\nalpha: \nomega:");

let REPLACEMENT = String.fromCharCode(0xFFFD);

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

test("guards against false positives due to Unicode sequences", () => {
	/*
	3️⃣ is a combination of an ASCII byte (digit three; 0x33) followed by a series
	of non-ASCII bytes - we want to make sure that parsing doesn't misinterpret
	the first byte as an ASCII stand-alone character
	*/
	let sepChar = "3";
	let sep = sepChar.charCodeAt(0);
	let overrides = [sepChar, sep];

	// deno-fmt-ignore
	let txt = ENCODER.encode(`
foo3️⃣bar3 lorem ipsum
baz3️⃣3dolor sit amet
…3 🤨
…3🤕 dolor
	`.trim() + "\n\n…");

	let res = parseHeaders(txt, true, overrides);
	// deno-fmt-ignore
	let expected = [
		"foo3️⃣bar", "lorem ipsum",
		"baz3️⃣", "dolor sit amet",
		"…", "🤨",
		"…", "🤕 dolor",
		"…",
	];
	assertDeep(bytes2strings(res), expected);

	// insert non-ASCII byte after first space
	let i = txt.indexOf(" ".charCodeAt(0));
	res = parseHeaders(toInserted([255], txt, i + 1), true, overrides);
	let _expected = structuredClone(expected);
	_expected[1] = REPLACEMENT + expected[1];
	assertDeep(bytes2strings(res), _expected);

	// insert non-ASCII byte after last inline separator
	i = txt.lastIndexOf(sep);
	res = parseHeaders(toInserted([255], txt, i + 1), true, overrides);
	_expected = structuredClone(expected);
	_expected[7] = REPLACEMENT + expected[7];
	assertDeep(bytes2strings(res), _expected);
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
