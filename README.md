# xk6-kerberos

k6 extension that adds support for [Kerberos](https://web.mit.edu/kerberos) authentication protocol. It adds a `k6/x/kerberos` JavaScript modules.

### JavaScript API

The extension exports a `UserClient` type usable for authenticate users over a Kerberos-secured environment.

```js
import { UserClient} `k6/x/kerberos`;

```

The client is expected to be instantiated by invoking its constructor passing through the Kerberos configuration.

```js
const kbClient = new UserClient(config, user.username, user.password, realm);

```

```
    const kbClient = new UserClient(krb5ini, user.username, user.password, realm);
    const token = kbClient.authenticate(service);
    session = token.negotiateHeader();

```

## Usage

To being able to use xk6-kerberos extension is required to build a new k6 binary. A detailed guide how to do it via a Docker or Go environment is available on the [extension's documentation](https://k6.io/docs/extensions/guides/build-a-k6-binary-using-go/).


## Example

In [examples/krb5](./examples/krb5) a [fully working testing environment](./examples/krb5/docker-compose.yml) and a [simple example](./examples/script.js) are available to demostrate how to use the `k6/x/kerberos` module to authenticate against a Kerberos server and perform a request to service protected by Kerberos authentication.

### How to run

[Docker Engine](https://docs.docker.com/engine), or a compatible alternative, is required. Please, make sure to have it installed before to start.

Run locally the Kerberos' testing environment.

```sh
$ docker compose -f ./examples/gokrb5/docker-compose.yml up -d
```

Build a new k6 wit the Kerberos extension.

```sh
$ docker run --rm -v $(pwd):/xk6 \
    grafana/xk6 build master \
    --with github.com/grafana/xk6-kerberos=.
```

> [!NOTE]  
> It uses the `master` branch as it uses the new `k6/experimental/fs` API. Soon avilable in v0.48.0 that isn't yet released.

Run the k6 test using the built binary.

```sh
docker run --rm -i \
  --network gokrb5_default \
  -v $(pwd)/k6:/usr/bin/k6 \
  -v $(pwd)/examples/gokrb5/krb5.conf:/home/k6/krb5.conf \
  grafana/k6:master run -<./examples/script.js
```

## Support

To get help, report bugs, suggest features, and discuss k6 with others, refer to k6 [SUPPORT.md](https://github.com/grafana/k6#support).

## Contribute

If you want to contribute or help with the development of xk6-kerberos, start by reading k6 [CONTRIBUTING.md](https://github.com/grafana/k6/blob/master/CONTRIBUTING.md). Before you start coding, it might be a good idea to first discuss your plans and implementation details with the k6 maintainers—especially when it comes to big changes and features. You can do this in the GitHub issue for the problem you're solving (create one if it doesn't exist).

> [!NOTE]  
> Note: To disclose security issues, refer to k6 [SECURITY.md](https://github.com/grafana/k6/blob/master/SECURITY.md).

## Development

The module is based on top of the [gokrb5](https://github.com/jcmturner/gokrb5) library.
