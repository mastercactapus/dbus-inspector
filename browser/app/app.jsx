import React from "react"

import "./styles.css"
import store from "./store"
import actions from "./actions"
import connectToStores from "alt/utils/connectToStores"

import ServiceFinder from "./service-finder.jsx"
import ObjectInspector from "./object-inspector.jsx"

class App extends React.Component {
	static getStores() {
		return [store]
	}

	static getPropsFromStores() {
		return store.getState()
	}

	constructor() {
		super()
		this.state = {}
	}

	componentWillMount() {
		actions.setBus("system")
	}

	tabChange(bus) {
		actions.setBus(bus)
	}

	render() {


		return <div style={{height: "100%", display: "flex", flex: 1, flexFlow: "column nowrap"}}>
			<div style={{flex: "0 auto", paddingBottom: "16px"}}>
				<input type="radio" onChange={e=>e.target.checked&&actions.setBus("system")} checked={this.props.bus=="system"} id="bus_system" /><label htmlFor="bus_system">System Bus</label>
				<input type="radio" onChange={e=>e.target.checked&&actions.setBus("session")} checked={this.props.bus=="session"} id="bus_session" /><label htmlFor="bus_session">Session Bus</label>
			</div>
			<div style={{flex: "1 100%", display: "flex", flexFlow: "row nowrap"}}>
					<div style={{flex: "1 30%", overflow: "auto"}}>
						<ServiceFinder />
					</div>
					<div style={{flex: "3 60%"}}>
						<ObjectInspector />
					</div>
			</div>
		</div>
	}
}

export default connectToStores(App)
