package kerberos

import (
	"bytes"
	"errors"
	"fmt"

	"github.com/dop251/goja"
	"github.com/jcmturner/gokrb5/v8/client"
	"github.com/jcmturner/gokrb5/v8/config"

	"go.k6.io/k6/js/common"
	"go.k6.io/k6/js/modules"
)

// init is called by the Go runtime at application startup.
func init() {
	modules.Register("k6/x/kerberos", New())
}

type (
	// RootModule is the global module instance that will create module
	// instances for each VU.
	RootModule struct{}

	// ModuleInstance represents an instance of the JS module.
	ModuleInstance struct {
		// vu provides methods for accessing internal k6 objects for a VU
		vu modules.VU
	}
)

// Ensure the interfaces are implemented correctly.
var (
	_ modules.Instance = &ModuleInstance{}
	_ modules.Module   = &RootModule{}
)

// New returns a pointer to a new RootModule instance.
func New() *RootModule {
	return &RootModule{}
}

// NewModuleInstance implements the modules.Module interface returning a new
// instance for each VU.
func (*RootModule) NewModuleInstance(vu modules.VU) modules.Instance {
	return &ModuleInstance{
		vu: vu,
	}
}

// Exports implements the [modules.Instance] interface and returns the exports
// of the JS module.
func (mi *ModuleInstance) Exports() modules.Exports {
	return modules.Exports{Named: map[string]interface{}{
		"UserClient": mi.newClient,
	}}
}

// newClient is the JS constructor for the Kerberos client.
func (mi *ModuleInstance) newClient(call goja.ConstructorCall) *goja.Object {
	rt := mi.vu.Runtime()

	if len(call.Arguments) < 3 {
		common.Throw(rt, errors.New("configuration, username and password are required arguments"))
	}

	user := call.Arguments[1].String()
	if user == "" {
		common.Throw(rt, errors.New("username cannot be empty"))
	}

	pass := call.Arguments[2].String()
	if user == "" {
		common.Throw(rt, errors.New("password cannot be empty"))
	}

	var realm string
	if len(call.Arguments) == 4 {
		realm = call.Arguments[3].String()
	}

	buf, err := toBuffer(mi.vu.Runtime(), call.Arguments[0])
	if err != nil {
		common.Throw(rt, fmt.Errorf("failed to parse configuration argument as expected ArrayBuffer: %w", err))
	}

	cfg, err := config.NewFromReader(bytes.NewReader(buf))
	if err != nil {
		common.Throw(rt, fmt.Errorf("failed to load the configuration: %w", err))
	}

	c := &Client{
		vu:      mi.vu,
		config:  cfg,
		kclient: client.NewWithPassword(user, realm, pass, cfg),
	}

	return rt.ToValue(c).ToObject(rt)
}
