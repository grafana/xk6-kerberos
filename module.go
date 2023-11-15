package kerberos

import (
	"go.k6.io/k6/js/modules"

	_ "github.com/jcmturner/gokrb5/v8/spnego"
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

// NewModuleInstance implements the modules.Module interface returning a new instance for each VU.
func (*RootModule) NewModuleInstance(vu modules.VU) modules.Instance {
	return &ModuleInstance{
		vu: vu,
	}
}

func (mi *ModuleInstance) Exports() modules.Exports {
	return modules.Exports{
		Default: func() string {
			return "not yet implemented"
		},
	}
}
