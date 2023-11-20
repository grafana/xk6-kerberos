import http from 'k6/http';
import exec from 'k6/execution';
import { fs } from 'k6/experimental/fs';
import { krb5 } from 'k6/x/kerberos';

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

const cfg;
(async function () {
	cfg = await open("krb5.ini"); // TODO: replace with a env var
})();

let session = null;

export default function () {
  if (session == null) {
    const user = users[exec.vu.idInTest];
    const krb5ini = readAll(cfg);
    const kos = new Client(cfg);
    const token = kos.authenticate(user.username, user.password, spn);
    session = token.NegotiateHeader()
  }

  let headers = {Authorization: session};
  const res = http.get('https://test.k6.io', headers);
}

func readAll(file) {
	const buffer = new Uint8Array(4);

  let totalBytesRead = 0;
	while (true) {
		const bytesRead = await file.read(buffer);
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

	if totalByteRead === 0 {
	  return null;
	}

	return buffer;
}
