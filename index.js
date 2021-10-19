"use strict";

let fs = require("fs");
let readline = require("readline");

// parses RFC 822-style text file with headers and body
// returns a promise of `{ headers, body }`
module.exports = function colonParse(filepath,
		{ trim = true, header } = {}) {
	let rl = readline.createInterface({
		input: fs.createReadStream(filepath),
		crlfDelay: Infinity
	});

	return new Promise((resolve, reject) => {
		let headers = {};
		let body;

		rl.on("line", line => {
			if(body) {
				body.push(line);
				return;
			}

			if(!line.trim() && Object.keys(headers).length) { // headers are done
				body = [];
				return;
			}

			// parse header
			let sep = ":";
			let i = line.indexOf(sep);
			if(i === -1) {
				body = false;
				let msg = `invalid header in \`${filepath}\`: \`${line}\``;
				reject(new Error(msg));
				return;
			}
			let key = line.substr(0, i);
			let value = line.substr(i + 1);
			if(trim) {
				key = key.trim();
				value = value.trim();
			}
			if(header) {
				[key, value] = header(key, value);
			}
			if(key !== null) {
				headers[key] = value;
			}
		});

		rl.on("close", _ => {
			if(body === false) { // already rejected
				return;
			}

			body = body.join("\n");
			if(trim) {
				body = body.trim();
			}
			resolve({ headers, body });
		});

		rl.on("error", err => {
			reject(err);
		});
	});
};
