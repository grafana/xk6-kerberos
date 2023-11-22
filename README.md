# xk6-kerberos

k6 extension that adds support for Kerberos authentication protocol.

## Run the example

Run locally the Kerberos' testing environment.

```
$ docker compose -f ./examples/gokrb5/docker-compose.yml up -d
```

Build a new k6 extension binary

```
$ xk6 build --with github.com/grafana/xk6-kerberos=.
```

Run the k6 test

```
docker run --rm -i \
  --network gokrb5_default \
  -v $(pwd)/k6:/usr/bin/k6 \
  -v $(pwd)/examples/gokrb5/krb5.conf:/home/k6/krb5.conf \
  grafana/k6:master run -<./examples/script.js
```

## Development

In [examples/gokrb5](./examples/gokrb5) you can find a [simple example](./examples/gokrb5/main.go) of how to use the 
[gokrb5](https://github.com/jcmturner/gokrb5) library to authenticate against a Kerberos server and perform a request
to an HTTP service behind the Kerberos authentication.
It comes with a [fully working dev environment](./examples/gokrb5/docker-compose.yml). 
