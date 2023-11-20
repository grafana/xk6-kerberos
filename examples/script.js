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
    const kos = new Client(krb5ini);
    const token = kos.authenticate(user.username, user.password, spn);
    session = token.NegotiateHeader()
  }

  let headers = {Authorization: session};
  const res = http.get('http://localhost:3939/myservice', headers);
}

async function readAll(file) {
	const buffer = new Uint8Array(4);

  let totalBytesRead = 0;
	while (true) {
		let bytesRead = await file.read(buffer);
		if (bytesRead == null) {
			// EOF
			break;
		}

		totalBytesRead += bytesRead;

		// If bytesRead is less than the buffer size, we've read the whole file
		if (bytesRead < buffer.byteLength) {
			break;
		}
	}

	if (totalBytesRead.length === 0) {
	  return null;
	}

	return buffer;
}
