import http from 'k6/http';
import exec from 'k6/execution';
import kerberos from 'k6/x/kerberos';

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

export default function() {
  const user = users[exec.vu.idInTest];
  const sessionToken = kerberos.authenticate(user.username, user.password);

  let headers = {
    Authorization: sessionToken.NegotiateHeader(), //`Negotiate ${kerberosToken}` } },
  };

  const res = http.get('https://test.k6.io', headers);
}
