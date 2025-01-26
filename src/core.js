let CR = "\r".charCodeAt(0);
let LF = "\n".charCodeAt(0);
let SEP = ":".charCodeAt(0);
let SPACE = " ".charCodeAt(0);

// emits header pairs along with trailing body, all as `Uint8Array`
export function* parseHeaders(bytes, trim = false) {
	let key = null;
	let headers = false;
	let offset = 0;
	for (let i = 0; i < bytes.length + 1; i++) {
		let char = bytes[i];
		if (key === null) { // header key
			if (char === SEP) { // ingest key
				key = bytes.slice(offset, i);
				// trim space suffix, if any (optimized for common case) -- XXX: ambiguity
				if (trim === true && bytes[++i] !== SPACE) {
					i--;
				}
				offset = i;
			} else if (isEOL(char, bytes, i)) {
				let line = headers && bytes.slice(offset, i);
				let msg = line
					? `invalid header: ${new TextDecoder().decode(line)}`
					: "missing RFC 822-style headers";
				throw new Error(msg);
			}
			continue;
		}

		let eol = isEOL(char, bytes, i);
		if (eol) { // header value or body
			// emit key and value
			yield key;
			yield bytes.slice(offset + 1, i);
			headers = true;
			if (eol === 2) {
				i++;
			}

			// conclude if blank line or EOF are imminent
			let next = i + 1;
			let sep = char === undefined || isEOL(bytes[next], bytes, next);
			if (sep) { // emit body
				yield bytes.slice(next + (sep === 2 ? 2 : 1));
				break;
			}

			key = null;
			offset = i + 1;
		}
	}
}

function isEOL(char, bytes, index) {
	switch (char) {
		case LF:
		case undefined: // EOF without trailing EOL
			return 1;
		case CR:
			return bytes[index + 1] === LF ? 2 : 1;
		default:
			return false;
	}
}
