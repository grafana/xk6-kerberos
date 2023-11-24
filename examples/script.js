import http from 'k6/http';
import exec from 'k6/execution';
import { check } from 'k6';
import { UserClient } from 'k6/x/kerberos';

// Set your k6 run configuration
export const options = {
  iterations: 1,
	thresholds: {
		checks: [{threshold: 'rate == 1.00', abortOnFail: true}],
		http_req_failed: [{threshold: 'rate == 0.00', abortOnFail: true}],
	},
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
  // It is recommended to read from an env variable
  // https://k6.io/docs/using-k6/environment-variables
	cfg = open(`${__ENV.KRB5_CONFIG}`);
})();

let session;

export default async function () {
  // We want a unique session for each single VU.
  if (session == null) {
		// In this specific example, we want to make sure that
	  // test is aborted if there is any unexpected error.
		try {
			const user = users[(exec.vu.idInTest-1) % users.length];
			const kbClient = new UserClient(cfg, user.username, user.password, realm);
			const token = kbClient.authenticate(service);
			session = token.negotiateHeader();
		} catch (e) {
			exec.test.abort(e);
		}
  }

  let headers = {Authorization: session};
  const res = http.get("http://http.example.com", headers);

  check(res, {
	  'is status 200': (r) => r.status === 200,
	  'response body contains': (r) => r.body.includes("It works!"),
  });
}