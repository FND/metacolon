export let ENCODER = new TextEncoder();
export let DECODER = new TextDecoder();

export function bytes2strings(items) {
	let res = [];
	for (let item of items) {
		res.push(DECODER.decode(item));
	}
	return res;
}

// returns a new `Uint8Array` with `items` spliced into `buf` after `offset`
export function toInserted(items, buf, offset) {
	let res = new Uint8Array(buf.length + items.length);
	res.set(buf.slice(0, offset));
	res.set(items, offset);
	res.set(buf.slice(offset), offset + 1);
	return res;
}
