import { colonParse } from "../src/index.js";
import { test } from "node:test";
import assert, {
	deepStrictEqual as assertDeep,
	strictEqual as assertSame,
} from "node:assert";

let FILES = ["./sample_lf.md", "./sample_crlf.md"]
	.map((filepath) => import.meta.resolve(filepath).replace("file://", ""));
let EXPECTED_START = `
lorem ipsum
dolor sit amet

consectetur adipisicing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua

* foo
* bar
* baz

ut enim ad minim veniam, quis nostrud exercitation ullamco laboris

----

The following text was chosen to trigger multi-chunk file streaming; boundaries
were determined empirically and might be subject to change.
`.trim() + "\n";
let EXPECTED_START_CRLF = EXPECTED_START.replaceAll("\n", "\r\n");
let EXPECTED_END = `
culpa qui officia deserunt mollit anim id est laborum.

EOF
`.trim() + "\n";
let EXPECTED_END_CRLF = EXPECTED_END.replaceAll("\n", "\r\n");

test("typical sample", async () => {
	for (let filepath of FILES) {
		let res = colonParse(filepath);
		assertSame(typeof res.then, "function", filepath);

		let { headers, body } = await res;
		// deno-fmt-ignore
		assertDeep(headers, new Map([
			["title", " Hello World"],
			["format", " txt"],
		]), filepath);
		assertContent(body, filepath);
	}
});

test("whitespace trimming", async () => {
	for (let filepath of FILES) {
		let { headers, body } = await colonParse(filepath, { trim: true });
		// deno-fmt-ignore
		assertDeep(headers, new Map([
			["title", "Hello World"],
			["format", "txt"],
		]), filepath);
		assertContent(body, filepath);
	}
});

test("balks at invalid file paths", async () => {
	let res = colonParse("./dummy.md");
	await assert.rejects(res, /ENOENT: .*dummy.md/);
});

function assertContent(body, filepath) {
	let crlf = filepath.endsWith("_crlf.md");
	assert(body.startsWith(crlf ? EXPECTED_START_CRLF : EXPECTED_START), filepath);
	assert(body.endsWith(crlf ? EXPECTED_END_CRLF : EXPECTED_END), filepath);
}
