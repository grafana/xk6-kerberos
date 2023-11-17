# xk6-kerberos

k6 extension that adds support for Kerberos authentication protocol.

## Development

In [examples/gokrb5](./examples/gokrb5) you can find a [simple example](./examples/gokrb5/main.go) of how to use the 
[gokrb5](https://github.com/jcmturner/gokrb5) library to authenticate against a Kerberos server and perform a request
to an HTTP service behind the Kerberos authentication.
It comes with a [fully working dev environment](./examples/gokrb5/docker-compose.yml). 