// emits header pairs along with trailing body, all as `Uint8Array`
export function* parseHeaders(bytes, trim = false) {
	let ROW_SEP = "\n".charCodeAt(0); // FIXME: assumes POSIX
	let COL_SEP = ":".charCodeAt(0);
	let SPACE = " ".charCodeAt(0);
	let key = null;
	let headers = false;
	let offset = 0;
	for (let i = 0; i < bytes.length + 1; i++) {
		let char = bytes[i];
		if (key === null) {
			if (char === COL_SEP) { // ingest key
				key = bytes.slice(offset, i);
				// trim space suffix, if any (optimized for common case) -- XXX: ambiguity
				if (trim === true && bytes[++i] !== SPACE) {
					i--;
				}
				offset = i;
			} else if (char === ROW_SEP || char === undefined) {
				let msg = "missing RFC 822-style headers";
				if (headers === true) {
					let line = bytes.slice(offset, i);
					msg = "invalid header: " + new TextDecoder().decode(line);
				}
				throw new Error(msg);
			}
		} else if (char === ROW_SEP || char === undefined) { // emit key and value
			yield key;
			yield bytes.slice(offset + 1, i);
			headers = true;

			if (char === undefined || bytes[i + 1] === ROW_SEP) { // emit body
				yield bytes.slice(i + 2);
				break;
			}

			key = null;
			offset = i + 1;
		}
	}
}
