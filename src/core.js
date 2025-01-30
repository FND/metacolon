let CR_CHAR = "\r";
let CR = CR_CHAR.charCodeAt(0);
let LF_CHAR = "\n";
let LF = LF_CHAR.charCodeAt(0);
let SEP_CHAR = ":";
let SEP = SEP_CHAR.charCodeAt(0);
let SPACE_CHAR = " ";
let SPACE = SPACE_CHAR.charCodeAt(0);

// emits header pairs along with trailing body, all as `Uint8Array`
export function* parseHeaders(bytes, trim = false, _overrides) {
	let [sepChar, sep] = _overrides ?? [SEP_CHAR, SEP];
	let key = null;
	let headers = false;
	let offset = 0;
	for (let i = 0; i < bytes.length + 1; i++) {
		let char = bytes[i];
		if (key === null) { // header key
			let next = bytes[i + 1];
			if (char === sep && isASCII(char, sepChar, bytes, i, next)) { // ingest key
				key = bytes.slice(offset, i);

				// trim space suffix, if any -- XXX: introduces ambiguity
				if (
					trim === true && next === SPACE &&
					isASCII(next, SPACE_CHAR, bytes, i + 1)
				) {
					i++;
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
			let done = char === undefined || isEOL(bytes[next], bytes, next);
			if (done) { // emit body
				yield bytes.slice(next + (done === 2 ? 2 : 1));
				break;
			}

			key = null;
			offset = i + 1;
		}
	}
}

function isEOL(char, bytes, index) {
	switch (char) {
		case CR: {
			let next = bytes[index + 1];
			if (isASCII(char, CR_CHAR, bytes, index, next)) {
				return next === LF ? 2 : 1;
			}
			break;
		}
		case LF:
			if (isASCII(char, LF_CHAR, bytes, index)) {
				return 1;
			}
			break;
		case undefined: // EOF without trailing EOL
			return 1;
	}
	return false;
}

function isASCII(marker, expectedChar, bytes, index, next = bytes[index + 1]) {
	// when encountering two ASCII bytes in a row, we can be sure that the first
	// one is a stand-alone ASCII character (i.e. not part of a Unicode sequence)
	if (marker > 127) {
		return false;
	}
	if (next < 128) {
		return true;
	}

	// avoid false positives by resorting to reliable Unicode comparison
	let chunk = bytes.slice(index, index + 5);
	let txt = new TextDecoder().decode(chunk);
	for (let { segment } of new Intl.Segmenter().segment(txt)) {
		// NB: we're only ever interested in the very first segment
		return segment === expectedChar;
	}
	throw new Error("unexpected input for ASCII check");
}
