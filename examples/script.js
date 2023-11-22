import http from 'k6/http';
import exec from 'k6/execution';
import { check } from 'k6';
import { open } from "k6/experimental/fs";
import { UserClient } from 'k6/x/kerberos';

// Set your k6 run configuration
export const options = {
  iterations: 1,
};

// Add here more users if required
var users = [{
  username: "testuser",
  password: "testpwd",
}];

const	spn = "HTTP/http.example.com"
const	realm = "EXAMPLE.COM"

let cfg;
(async function () {
	cfg = await open("./gokrb5/krb5.conf");
})();

let session;

export default async function () {
  if (session == null) {
    const user = users[(exec.vu.idInTest-1) % users.length];
    const krb5ini = await readAll(cfg);

    const kbClient = new UserClient(krb5ini, user.username, user.password, realm);
    const token = kbClient.authenticate(spn);
    session = token.negotiateHeader();
  }

  let headers = {Authorization: session};
  const res = http.get("http://http.example.com", headers);

  check(res, {
	  'is status 200': (r) => r.status === 200,
	  'response body contains': (r) => r.body.includes("It works!"),
  });
}

async function readAll(file) {
  const finfo = await file.stat();
  const buffer = new Uint8Array(finfo.size+1);

	let bytesRead = await file.read(buffer);
	if (bytesRead !== finfo.size) {
		// we don't expect to have more or less to read
		// from the defined file size
		throw new Error("the read file doesn't match the expected size")
	}

	return buffer;
}
