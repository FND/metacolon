export let ENCODER = new TextEncoder();
export let DECODER = new TextDecoder();

export function bytes2strings(items) {
	return [...items.map((item) => DECODER.decode(item))];
}
