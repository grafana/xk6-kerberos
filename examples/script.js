import http from 'k6/http';
import exec from 'k6/execution';
import { check } from 'k6';
import { open } from "k6/experimental/fs";
import { UserClient } from 'k6/x/kerberos';

// Set your k6 run configuration
export const options = {
  iterations: 1,
};

// Add your users here
var users = [{
  username: "testuser",
  password: "testpwd",
}];

// Set your domain
const	service = "HTTP/http.example.com"
const	realm = "EXAMPLE.COM"

// Load the Kerberos configuration file
let cfg;
(async function () {
  // It is better to read from an env variable
  // https://k6.io/docs/using-k6/environment-variables
	cfg = await open("/home/k6/krb5.conf");
})();

let session;

export default async function () {
  // We want a unique session for each single VU.
  if (session == null) {
    const user = users[(exec.vu.idInTest-1) % users.length];
    const krb5ini = await readAll(cfg);

    const kbClient = new UserClient(krb5ini, user.username, user.password, realm);
    const token = kbClient.authenticate(service);
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
