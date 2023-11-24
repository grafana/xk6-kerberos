import http from 'k6/http';
import exec from 'k6/execution';
import {Client} from 'k6/x/kerberos';
import {describe, expect} from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';


export const options = {
	thresholds: {
		checks: [{threshold: 'rate == 1.00', abortOnFail: true}],
		http_req_failed: [{threshold: 'rate == 0.00', abortOnFail: true}],
	},
};

const user = "testuser"
const realm = "EXAMPLE.COM"
const pass = "testpwd"

const spn = "HTTP/http.example.com"

let krb5cfg;
(async function () {
	krb5cfg = await open(${__ENV.KRB5_CONFIG}); // TODO: replace with a env var
})();

let session;

export default async function () {
	if (session == null) {
		try {
			const kos = new Client(user, realm, pass, krb5cfg);
			const token = kos.authenticate(spn);
			session = token.negotiateHeader()
		} catch (e) {
			exec.test.abort(e);
		}
	}

	describe('Authenticated request', () => {
		let headers = {Authorization: session};
		const res = http.get('http://http.example.com', headers);

		expect(res.status, 'response status').to.equal(200);
		expect(res.body, 'response body').to.include("It works!");
	});
}