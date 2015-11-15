package main

import (
	"encoding/json"
	"encoding/xml"
	"github.com/godbus/dbus"
	"github.com/godbus/dbus/introspect"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"io"
	"net/http"
	"os"
	"path"
)

const pagedata = `
<!DOCTYPE html>
<html>
<head>
	<title>DBUS Inspector</title>
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body>
	<div id="app"></div>
	<script src="/app.js"></script>
</body>
</html>
`

func js(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		panic(err)
	}
}
func index(w http.ResponseWriter, req *http.Request) {
	log.Println("index.html")
	io.WriteString(w, pagedata)
}
func appjs(w http.ResponseWriter, req *http.Request) {
	fd, err := os.Open("public/app.js")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer fd.Close()
	w.Header().Set("Content-Type", "application/javascript")
	io.Copy(w, fd)
}
func getBus(vars map[string]string) *dbus.Conn {
	switch vars["bus"] {
	case "system":
		return SystemBus
	case "session":
		return SessionBus
	default:
		return nil
	}
}
func handleListServices(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bus := getBus(vars)
	if bus == nil {
		http.NotFound(w, r)
		return
	}

	names, err := ListServices(bus)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	js(w, &names)
}

func recurseObjects(bus *dbus.Conn, service, prefix string) ([]string, error) {
	var s string

	err := bus.Object(service, dbus.ObjectPath(prefix)).Call("org.freedesktop.DBus.Introspectable.Introspect", 0).Store(&s)
	if err != nil {
		return nil, err
	}

	var n introspect.Node
	err = xml.Unmarshal([]byte(s), &n)
	if err != nil {
		return nil, err
	}

	names := make([]string, 0, 100)
	if len(n.Interfaces) > 1 {
		names = append(names, prefix)
	}

	for _, child := range n.Children {
		childPath := path.Join(prefix, child.Name)
		items, err := recurseObjects(bus, service, childPath)
		if err != nil {
			return nil, err
		}
		names = append(names, items...)
	}

	return names, nil
}

func handleListObjects(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bus := getBus(vars)
	if bus == nil {
		http.NotFound(w, r)
		return
	}

	items, err := recurseObjects(bus, vars["service"], "/")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	js(w, items)
}

func handleListInterfaces(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bus := getBus(vars)
	if bus == nil {
		http.NotFound(w, r)
		return
	}

	var s string
	err := bus.Object(vars["service"], dbus.ObjectPath(r.URL.Query().Get("objectPath"))).Call("org.freedesktop.DBus.Introspectable.Introspect", 0).Store(&s)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var n introspect.Node
	err = xml.Unmarshal([]byte(s), &n)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	js(w, &n)
}

func ListenAndServe(addr string) {
	r := mux.NewRouter()
	r.HandleFunc("/api/bus/{bus}", handleListServices)
	r.HandleFunc("/api/bus/{bus}/{service}", handleListObjects)
	r.HandleFunc("/api/bus/{bus}/{service}/interfaces", handleListInterfaces)
	r.HandleFunc("/app.js", appjs)
	r.HandleFunc("/", index)

	log.Infoln("Listening:", addr)
	http.ListenAndServe(addr, r)
}
