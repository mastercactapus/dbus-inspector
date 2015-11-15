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

func monitor(conn *dbus.Conn, name string) {
	call := conn.BusObject().Call("org.freedesktop.DBus.Monitoring.BecomeMonitor", 0, []string{}, uint32(0))
	if call.Err != nil {
		log.Warnln("BecomeMonitor not supported, falling back to AddMatch:", call.Err)
		for _, v := range []string{"method_call", "method_return", "error", "signal"} {
			call = conn.BusObject().Call("org.freedesktop.DBus.AddMatch", 0,
				"eavesdrop='true',type='"+v+"'")
			if call.Err != nil {
				log.Fatalln("add match:", call.Err)
			}
		}
	}

	ch := make(chan *dbus.Message, 1000)
	conn.Eavesdrop(ch)
	log.Infoln("Monitoring", name, "bus")
	for m := range ch {
		log.WithField("bus", name).Infoln(m)
	}
}

func main() {
	var err error
	SystemBus, err = dbus.SystemBus()
	if err != nil {
		log.Errorln("connect to system bus:", err)
	} else {
		go monitor(SystemBus, "system")
	}
	SessionBus, err = dbus.SessionBus()
	if err != nil {
		log.Errorln("connect to session bus:", err)
	} else {
		go monitor(SessionBus, "session")
	}

	log.Fatalln(ListenAndServe(":3000"))
}
