# xk6-kerberos

k6 extension that adds Kerberos/SPNEGO authentication to load tests. Users construct a client with a krb5 config and credentials, authenticate against a service principal, and use the resulting token as an HTTP Authorization header.

## Architecture

The extension follows k6's standard module pattern: a root module registered at init time creates per-VU instances. Each instance exposes a single JS constructor that parses a Kerberos config (from an ArrayBuffer or string) and creates a protocol client using a Grafana fork of the gokrb5 library.

The authentication flow is: acquire credentials via SPNEGO, obtain a service ticket for the target SPN, marshal the SPNEGO token, and return it as a base64-encoded string. The token type has a convenience method that formats it as a `Negotiate` header value.

The config argument parsing handles both ArrayBuffer and String JS types by inspecting the value's constructor identity at runtime. It does not use type assertions on the Go side -- it compares JS constructor references.

There is no VU-level state beyond the client itself. One client per VU is the expected pattern. The client refuses to authenticate outside VU context (returns an error if VU state is nil).

The realm argument is optional. When omitted, the gokrb5 library infers the realm from the config. PAFXFast is explicitly disabled in the client construction.

## Gotchas

- The password validation check has a copy-paste bug: it tests the username variable instead of the password variable. An empty password silently passes validation. The error message says "password cannot be empty" but the condition checks the wrong variable.

- There are no unit tests in this repo. All testing relies on an end-to-end workflow that spins up a real Kerberos KDC and Apache server in Docker containers.

- The gokrb5 dependency is a Grafana-maintained fork, not the upstream jcmturner version. Updating it requires using the Grafana fork's module path.

- The linter config is not checked in. It is downloaded from the k6 main repo on first lint run. Do not commit it.
