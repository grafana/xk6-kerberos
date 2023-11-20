package kerberos

import (
	"encoding/base64"
	"errors"
	"fmt"

	"github.com/dop251/goja"
	"github.com/jcmturner/gokrb5/v8/client"
	"github.com/jcmturner/gokrb5/v8/config"
	"github.com/jcmturner/gokrb5/v8/spnego"
	"go.k6.io/k6/js/common"
	"go.k6.io/k6/js/modules"
)

type Client struct {
	config *config.Config
	realm  string
	vu     modules.VU
}

func (c *Client) Authenticate(user, password, spn string) (string, error) {
	if c.vu.State() == nil {
		return "", fmt.Errorf("is not allowed to be used outside of the VU context")
	}
	kclient := client.NewWithPassword(user, c.realm, password, c.config)
	s := spnego.SPNEGOClient(kclient, spn)
	if err := s.AcquireCred(); err != nil {
		return "", err
	}

	st, err := s.InitSecContext()
	if err != nil {
		return "", err
	}

	nb, err := st.Marshal()
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(nb), nil
}

type Token string

func (t Token) NegotiateHeader() string {
	return "Negotiate " + string(t)
}

func toBuffer(rt *goja.Runtime, v goja.Value) ([]byte, error) {
	if common.IsNullish(v) {
		return nil, errors.New("value cannot be null or undefined")
	}

	obj := v.ToObject(rt)
	uint8ArrayConstructor := rt.Get("Uint8Array")
	if isUint8Array := obj.Get("constructor").SameAs(uint8ArrayConstructor); !isUint8Array {
		return nil, errors.New("value must be a Uint8Array")
	}

	// Obtain the underlying ArrayBuffer from the Uint8Array
	ab, ok := obj.Get("buffer").Export().(goja.ArrayBuffer)
	if !ok {
		return nil, errors.New("value must be a Uint8Array")
	}

	return ab.Bytes(), nil
}
