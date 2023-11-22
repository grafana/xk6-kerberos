// Package kerberos provides a JavaScript module for Kerberos authentication.
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

// Client is the main object exposed on the JavaScript API.
// It's a wrapper that holds a Kerberos configuration and a Kerberos client.
// It exposes the main [Authenticate] method for Kerberos authentication.
type Client struct {
	config  *config.Config
	kclient *client.Client
	vu      modules.VU
}

// Authenticate uses [Client] credentials to acquire a ticket-granting ticket,
// if needed, and then uses that one to acquire a service ticket for the given
// Service Principal Name (SPN).
func (c *Client) Authenticate(spn string) (Token, error) {
	if c.vu.State() == nil {
		return "", fmt.Errorf("is not allowed to be used outside of the VU context")
	}

	s := spnego.SPNEGOClient(c.kclient, spn)
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

	return Token(base64.StdEncoding.EncodeToString(nb)), nil
}

// Token is a base64-encoded token that holds a Kerberos service ticket.
type Token string

// NegotiateHeader returns the token in a format that can be used in the
// Authentication header of an HTTP request against a service using
// Kerberos authentication.
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
