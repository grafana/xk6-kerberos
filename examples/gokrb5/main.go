package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"

	"github.com/jcmturner/gokrb5/v8/client"
	"github.com/jcmturner/gokrb5/v8/config"
	"github.com/jcmturner/gokrb5/v8/spnego"
)

const (
	cfg = "krb5.conf"

	usr = "testuser"
	pwd = "testpwd"

	spn   = "HTTP/http.example.com"
	realm = "EXAMPLE.COM"
)

func main() {
	krb5, err := newKrb5Client(cfg, realm, usr, pwd)
	if err != nil {
		log.Fatal(err)
	}

	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, "http://http.example.com", nil)
	if err != nil {
		log.Fatal(err)
	}

	tk, err := krb5.token(spn)
	if err != nil {
		log.Fatal(err)
	}

	req.Header.Set("Authorization", "Negotiate "+tk)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}

	rawResp, err := httputil.DumpResponse(resp, true)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(string(rawResp))
}

type krb5Client struct {
	cfg    *config.Config
	client *client.Client
}

func newKrb5Client(cfgPath, realm, usr, pwd string) (krb5Client, error) {
	cfg, err := config.Load(cfgPath)
	if err != nil {
		return krb5Client{}, err
	}

	return krb5Client{
		cfg:    cfg,
		client: client.NewWithPassword(usr, realm, pwd, cfg),
	}, nil
}

func (c krb5Client) token(spn string) (string, error) {
	s := spnego.SPNEGOClient(c.client, spn)

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
