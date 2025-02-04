import { parseHeaders } from "./core.js";
import { readFile } from "node:fs/promises";

export async function colonParse(filepath, options) {
	let data = await readFile(filepath);
	let headers = new Map();
	let decoder = new TextDecoder();
	let key = null;
	for (let item of parseHeaders(data, options?.trim === true)) {
		item = decoder.decode(item);
		if (key === null) {
			key = item;
		} else {
			headers.set(key, item);
			key = null;
		}
	}
	return { headers, body: key };
}
