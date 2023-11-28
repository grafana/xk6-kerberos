k6/x/kerberos
=============

xk6-kerberos enables k6 tests to perform tests on environments secured with [Kerberos](https://web.mit.edu/kerberos).

UserClient
----------

The `UserClient` is the main class to interact with Kerberos, it is used to authenticate against a Kerberos server (KDC) and obtain a ticket granting ticket (TGT) and service ticket (ST) for a given service principal name (SPN).

### UserClient()

```ts
constructor(config: ArrayBuffer, username: string, password: string, realm?: string);
```

-	`config` The [Kerberos configuration](https://web.mit.edu/kerberos/krb5-1.12/doc/admin/conf_files/krb5_conf.html) bytes. Typically available in defined `krb5.conf` file.

-	`username` The user's username.

-	`password` The user's password.

-	`realm` *Optional*. If not defined, it uses the default realm from config.

The UserClient() is the main constructor to instantiate a new Kerberos client for a given user.

*Returns a `UserClient` instance.*

### UserClient.authenticate()

```ts
authenticate(spn: string): Token;
```

-	`spn` The service principal name (SPN) to request a service ticket (ST) for.

The `authenticate()` method uses the ticket granting ticket (TGT) stored in the `UserClient` instance to request a service ticket (ST) for a given service principal name (SPN).

*Returns a `Token` instance, that contains the service ticket (ST).*

Token
-----

### Token.negotiateHeader()

```ts
negotiateHeader(): string;
```

The `negotiateHeader()` returns the value for the expected [SPNEGO](https://datatracker.ietf.org/doc/html/rfc4559#section-4.2) HTTP header to pass to HTTP services.

*Returns the `Authentication` header value, including the `Negotiate` prefix.*
