import { colonParse } from "../src/index.js";
import { test } from "node:test";
import assert, {
	deepStrictEqual as assertDeep,
	strictEqual as assertSame,
} from "node:assert";

let FILEPATH = import.meta.resolve("./sample.md").replace("file://", "");
let EXPECTED_BODY_START = `
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
let EXPECTED_BODY_END = `
culpa qui officia deserunt mollit anim id est laborum.

EOF
`.trim() + "\n";

test("typical sample", async () => {
	let res = colonParse(FILEPATH);
	assertSame(typeof res.then, "function");

	let { headers, body } = await res;
	// deno-fmt-ignore
	assertDeep(headers, new Map([
		["title", " Hello World"],
		["format", " txt"],
	]));
	assert(body.startsWith(EXPECTED_BODY_START));
	assert(body.endsWith(EXPECTED_BODY_END));
});

test("whitespace trimming", async () => {
	let { headers, body } = await colonParse(FILEPATH, { trim: true });
	// deno-fmt-ignore
	assertDeep(headers, new Map([
		["title", "Hello World"],
		["format", "txt"],
	]));
	assert(body.startsWith(EXPECTED_BODY_START));
	assert(body.endsWith(EXPECTED_BODY_END));
});

test("balks at invalid file paths", async () => {
	let res = colonParse("./dummy.md");
	await assert.rejects(res, /ENOENT: .*dummy.md/);
});
