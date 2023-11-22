import http from 'k6/http';
import exec from 'k6/execution';
import { open } from "k6/experimental/fs";
import { Client } from 'k6/x/kerberos';

export const options = {
  iterations: 1,
};

var users = [{
  username: "user1",
  password: "safe-loaded-secret",
},{
  username: "user2",
  password: "safe-loaded-secret-2"
}];

const	spn = "HTTP/http.example.com"
const	realm = "EXAMPLE.COM"

let cfg;
(async function () {
	cfg = await open("./gokrb5/krb5.conf"); // TODO: replace with a env var
})();

let session;

export default async function () {
  if (session == null) {
    const user = users[exec.vu.idInTest];
    const krb5ini = await readAll(cfg);
	const kos = new Client(user.username, realm, user.password, krb5ini);
  	const token = kos.authenticate(spn);
    session = token.negotiateHeader()
  }

	let headers = {Authorization: session};
	const res = http.get('http://http.example.com', headers);
	check(res, {
		'is status 200': (r) => r.status === 200,
	});
}

async function readAll(file) {
	const buffer = new Uint8Array(1024);
	let all = new Uint8Array(0);

	let totalBytesRead = 0;
	while (true) {
		let bytesRead = await file.read(buffer);
		if (bytesRead == null) {
			// EOF
			break;
		}

		// Append the read bytes to the total content
		const tmp = new Uint8Array(all.length + bytesRead);
		tmp.set(all, 0);
		tmp.set(buffer.slice(0, bytesRead), all.length);
		all = tmp;

		// If bytesRead is less than the buffer size, we've read the whole file
		totalBytesRead += bytesRead;
		if (bytesRead < buffer.byteLength) {
			break;
		}
	}

	if (totalBytesRead === 0) {
		return null;
	}

	return all;
}
