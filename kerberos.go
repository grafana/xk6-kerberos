package kerberos

import (
	"errors"
	"go.k6.io/k6/js/modules"
)

// init invokes module registration.
func init() {
	register(newModule)
}

// newModule returns new goModuleImpl instance.
func newModule(_ modules.VU) goModule {
	return new(goModuleImpl)
}

// goModuleImpl is an empty implementation of goModule.
type goModuleImpl struct{}

var _ goModule = (*goModuleImpl)(nil)

// newUserClient is a goModule method implementation.
func (self *goModuleImpl) newUserClient(configArg []byte, usernameArg string, passwordArg string, realmArg string) (goUserClient, error) {
	return nil, errors.ErrUnsupported
}

// goTokenImpl is an empty implementation of goToken.
type goTokenImpl struct{}

var _ goToken = (*goTokenImpl)(nil)

// negotiateHeaderMethod is a goToken method implementation.
func (self *goTokenImpl) negotiateHeaderMethod() (string, error) {
	return "", errors.ErrUnsupported
}

// goUserClientImpl is an empty implementation of goUserClient.
type goUserClientImpl struct{}

var _ goUserClient = (*goUserClientImpl)(nil)

// authenticateMethod is a goUserClient method implementation.
func (self *goUserClientImpl) authenticateMethod(spnArg string) (goToken, error) {
	return nil, errors.ErrUnsupported
}
