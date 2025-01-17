import { parseHeaders } from "./core.js";
import { createReadStream } from "node:fs";

let PROMISE = Promise.withResolvers ? Promise : { withResolvers };

export function colonParse(filepath, options) {
	let stream = createReadStream(filepath);
	let { promise, resolve, reject } = PROMISE.withResolvers();
	let data;
	stream.on("data", (chunk) => {
		if (data === undefined) {
			data = chunk;
			return;
		}

		let offset = data.length;
		let buf = new Uint8Array(offset + chunk.length);
		buf.set(data);
		buf.set(chunk, offset);
		data = buf;
	});
	stream.on("error", (err) => {
		reject(err);
	});
	stream.on("end", () => {
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
		let body = key;
		resolve({ headers, body });
	});
	return promise;
}

function withResolvers() {
	let res = {};
	res.promise = new Promise((resolve, reject) => {
		res.resolve = resolve;
		res.reject = reject;
	});
	return res;
}
