# xk6-kerberos

xk6-kerberos is an [extension for k6](https://k6.io/docs/extensions/). It adds support for the [Kerberos](https://web.mit.edu/kerberos) authentication protocol to k6, enabling you to perform tests on environments secured with [Kerberos](https://web.mit.edu/kerberos). 


```javascript
import http from 'k6/http';
import fs from 'k6/experimental/fs';
import kerberos from 'k6/x/kerberos';

// Open the Kerberos configuration file
let configFile;
(async function () {
	configFile = await open("krb5.conf");
})();

export default function() {
  // Read the content of the configuration file
  const config = await readAll(cfg); 

  // A UserClient can be used to authenticate a single user in a kerberos-secured environment.
  const client = new kerberos.UserClient(config, 'myusername', 'mypassword');

  // The authenticate method obtains a kerberos service ticket.
  const token = client.authenticate(service);

  // Which in turn can be used to generate a SPNEGO HTTP header to pass to
  // HTTP services.
  const negotiatedHeader = token.negotiateHeader();

  // Perform an authenticated request to a kerberos-secured HTTP service.
  http.get('https://test-api.k6.io', { Authorization: negociatedHeader });
}

// readAll is a helper function to read the whole content of a file into
// a Uint8Array buffer
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
```

## Getting started

Using the xk6-kerberos extension involves building a k6 binary incorporating it. A detailed guide on how to do this using a Docker or Go environment is available in the [extension's documentation](https://k6.io/docs/extensions/guides/build-a-k6-binary-using-go/).

1. Build a k6 binary incorporating the xk6-kerberos extension
```bash
xk6 build --with github.com/grafana/xk6-kerberos=.
```

2. Run a test script with the newly built binary
```bash
./k6 run script.js
```

## Usage

Once [built](#getting-started) into a k6 executable using [xk6](https://github.com/grafana/xk6), the extension can be imported by load test scripts as the `k6/x/kerberos` JavaScript module.

```javascript
import kerberos from 'k6/x/kerberos';
```

### UserClient

The module exports a `UserClient` type which can be used to authenticate a single user in a Kerberos-secured environment. Construct a `UserClient` instance by passing the Kerberos configuration and user credentials.

```js
const client = new UserClient(config, username, password, realm)
```

The table below details the expected arguments:

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| Configuration | ArrayBuffer | Yes | It contains the [Kerberos configuration](https://web.mit.edu/kerberos/krb5-1.12/doc/admin/conf_files/krb5_conf.html). Typically available in defined `krb5.conf` file. |
| Username      | string      | Yes | The user's username. |
| Password      | string      | Yes | The user's password. |
| Realm         | string      | No  | Optional. If not defined, it uses the default realm from config. |

An initialized client can then be used to get Kerberos service tickets.

```js
const token = client.authenticate(service);
```

The returned `session` can be used to generate the expected [SPNEGO](https://datatracker.ietf.org/doc/html/rfc4559#section-4.2) HTTP header to pass to HTTP services.

```js
const header = token.negotiateHeader();
```

It can be then used along the `k6/http` module to submit authenticated requests to an HTTP service.

```js
import http from 'k6/http';

let headers = {Authorization: negotiateHeader};
http.get('http://test.k6.io', headers);
```

## Example

In [examples/krb5](./examples/krb5) a [fully working testing environment](./examples/krb5/docker-compose.yml) and a [simple example](./examples/script.js) are available to demonstrate how to use the `k6/x/kerberos` module to authenticate against a Kerberos server and perform a request to a service protected by Kerberos authentication.

### How to run

[Docker Engine](https://docs.docker.com/engine), or a compatible alternative, is required. Please make sure to have it installed before starting.

Run locally the Kerberos' testing environment.

```sh
$ docker compose -f ./examples/krb5/docker-compose.yml up -d
```

Build a new k6 binary incorporating the Kerberos extension.

```sh
$ docker run --rm -v $(pwd):/xk6 \
    grafana/xk6 build master \
    --with github.com/grafana/xk6-kerberos=.
```

> [!NOTE]  
> It uses the `master` branch as it uses the new `k6/experimental/fs` API. Coming soon in v0.48.0, which has not yet been released.

Run the k6 test using the built binary.

```sh
docker run --rm -i \
  --network krb5_default \
  -v $(pwd)/k6:/usr/bin/k6 \
  -v $(pwd)/examples/krb5/krb5.conf:/home/k6/krb5.conf \
  -e KRB5_CONFIG=/home/k6/krb5.conf \
  grafana/k6:master run -<./examples/script.js
```

## Support

To get help, report bugs, suggest features, and discuss k6 with others, refer to k6 [SUPPORT.md](https://github.com/grafana/k6#support).

## Contribute

If you want to contribute or help with the development of xk6-kerberos, start by reading k6 [CONTRIBUTING.md](https://github.com/grafana/k6/blob/master/CONTRIBUTING.md).  Before you start coding, it might be a good idea to discuss your plans and implementation details with the k6 maintainers—especially regarding big changes and features. You can do this in the GitHub issue for the problem you're solving (create one if it doesn't exist).

> [!NOTE]  
> To disclose security issues, refer to k6 [SECURITY.md](https://github.com/grafana/k6/blob/master/SECURITY.md).

## Development

The module is based on top of the [gokrb5](https://github.com/jcmturner/gokrb5) library.
