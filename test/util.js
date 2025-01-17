export let ENCODER = new TextEncoder();
export let DECODER = new TextDecoder();

export function bytes2strings(items) {
	let res = [];
	for (let item of items) {
		res.push(DECODER.decode(item));
	}
	return res;
}
