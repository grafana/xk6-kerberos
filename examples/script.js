import http from 'k6/http';
import exec from 'k6/execution';
import { check } from 'k6';
import { UserClient } from 'k6/x/kerberos';

// Set your k6 run configuration
// https://k6.io/docs/using-k6/k6-options
export const options = {
  iterations: 1,

  // Demonstrative k6 threasholds
  thresholds: {
    checks: [{ threshold: 'rate == 1.00', abortOnFail: true }],
    http_req_failed: [{ threshold: 'rate == 0.00', abortOnFail: true }],
  },
};

// Load your users' credentials
// 
// In production enviroment is recommended to not hardcode credentials
// but use good practices like environment variables https://k6.io/docs/using-k6/environment-variables
//
// If you need to load a big list consider to use a SharedArray https://k6.io/docs/javascript-api/k6-data/sharedarray
// for reducing the memory usage by sharing resources.
var users = [{
  username: "testuser",
  password: "testpwd",
}];

// Set your Kerberos domain
const service = "HTTP/http.example.com"
const realm = "EXAMPLE.COM"

// Open and load the Kerberos configuration file
//
// It is recommended to read from an env variable
// https://k6.io/docs/using-k6/environment-variables
const config = open(`${__ENV.KRB5_CONFIG}`);

// This test comes with the assumption to have a 1:1 relationship between k6 VUs and authenticated users.
// It means every spawn k6 virtual user will load and authenticate only one specific user. 
let session;

export default async function () {
  // A unique session is assigned for each VU.
  // This check prevent to re-authenticate the user for all iterations the VU will run.
  if (session == null) {
    try {
      // It uses the unique identifier of the VU as the index for accessing a single pair of credentials.
      // As we may decide to have more iterations of the defined credentials
      // we let the index to be cyclical.
      const user = users[(exec.vu.idInTest - 1) % users.length];

      // Authenticate the user and get the session token.
      const client = new UserClient(config, user.username, user.password, realm);
      const token = client.authenticate(service);
      session = token.negotiateHeader();
    } catch (e) {
      exec.test.abort(e);
    }
  }

  // Run HTTP requests using the previously authenticated user.
  const res = http.get("http://http.example.com", { Authorization: session });

  // Simple demonstrative k6 checks.
  check(res, {
    'is status 200': (r) => r.status === 200,
    'response body contains': (r) => r.body.includes("It works!"),
  });
}
