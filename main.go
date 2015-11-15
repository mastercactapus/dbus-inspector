package main

import (
	"fmt"
	"github.com/godbus/dbus"
	log "github.com/sirupsen/logrus"
)

var SystemBus, SessionBus *dbus.Conn

func ListServices(bus *dbus.Conn) ([]string, error) {
	if bus == nil {
		return nil, fmt.Errorf("bus not available")
	}
	var services []string
	err := bus.BusObject().Call("org.freedesktop.DBus.ListNames", 0).Store(&services)
	if err != nil {
		return nil, err
	}
	return services, nil
}

func main() {
	var err error
	SystemBus, err = dbus.SystemBus()
	if err != nil {
		log.Errorln("connect to system bus:", err)
	}
	SessionBus, err = dbus.SessionBus()
	if err != nil {
		log.Errorln("connect to session bus:", err)
	}

	ListenAndServe(":3000")
}
