import React from "react"
import _ from "lodash"
import connectToStores from "alt/utils/connectToStores"

import actions from "./actions"
import store from "./store"

import TreeView from "react-treeview"
import "react-treeview/react-treeview.css"


const typeNames = {
	y: "byte",
	b: "bool",
	n: "int16",
	q: "uint16",
	i: "int32",
	u: "uint32",
	x: "int64",
	t: "uint64",
	d: "double",
	h: "fd",
	s: "string",
	o: "ObjectPath",
	a: "[]",
	v: "Variant",
	g: "Signature",
	"(": "{",
	")": "}"
}

function typeString(code) {
	return _.map(code, function(str){
		return typeNames[str]
	});
}

class _ObjectNode extends React.Component {
	static getStores() {
		return [store]
	}

	static getPropsFromStores() {
		return store.getState()
	}

	constructor() {
		super()
		this.state = {
			collapsed: true
		}
	}

	renderMethod(m, key) {
		var inArgs = _.chain(m.Args)
		.filter({Direction: "in"})
		.map(function(arg){
			return arg.Name + " " + typeString(arg.Type)
		})
		.value()
		.join(", ")

		var outArgs = _.chain(m.Args)
		.filter({Direction: "out"})
		.map(function(arg){
			return arg.Name + " " + typeString(arg.Type)
		})
		.value()
		.join(", ")

		var sig = m.Name + " (" + inArgs + ") => (" + outArgs + ")"

		return <div key={key}>{sig}</div>
	}
	renderSignal(s, key) {
		var args = _.chain(s.Args)
		.map(function(arg){
			return arg.Name + " " + typeString(arg.Type)
		})
		.value()
		.join(", ")

		var sig = s.Name + " (" + args + ")"

		return <div key={key}>{sig}</div>
	}
	renderProperty(p, key) {
		var sig = typeString(p.Type) + " " + p.Name + " (" + p.Access + ")"
		return <div key={key}>{sig}</div>
	}

	renderInterface(iface, key) {
		var methods, signals, properties
		if (iface.Methods) {
			methods = <TreeView defaultCollapsed={false} nodeLabel={<b>Methods</b>}>
				{_.chain(iface.Methods).sortBy("Name").map(this.renderMethod, this).value()}
			</TreeView>
		}
		if (iface.Signals) {
			signals = <TreeView defaultCollapsed={false} nodeLabel={<b>Signals</b>}>
				{iface.Signals.map(this.renderSignal.bind(this))}
			</TreeView>
		}
		if (iface.Properties) {
			properties = <TreeView defaultCollapsed={false} nodeLabel={<b>Properties</b>}>
				{iface.Properties.map(this.renderProperty.bind(this))}
			</TreeView>
		}

		return <TreeView key={key} defaultCollapsed={true} nodeLabel={iface.Name}>
			{methods}
			{signals}
			{properties}
		</TreeView>
	}

	renderContents() {
		if (!this.props.interfaces[this.props.path]) {
			return "Loading..."
		}

		var interfaces = _.map(this.props.interfaces[this.props.path], this.renderInterface, this)

		return <TreeView defaultCollapsed={false} nodeLabel={<b>Interfaces</b>}>
			{interfaces}
		</TreeView>

	}

	render() {
		console.log("render!")
		return <TreeView defaultCollapsed={true} onClick={e=>actions.fetchInterfaces(this.props.path)} nodeLabel={this.props.path}>
			<div onClick={e=>e.stopPropagation()}>{this.renderContents()}</div>
		</TreeView>
	}
}

const ObjectNode = connectToStores(_ObjectNode)

class ObjectInspector extends React.Component {
	static getStores() {
		return [store]
	}

	static getPropsFromStores() {
		return store.getState()
	}

	constructor(){
		super()
		this.state = {}
	}

	render() {
		if (this.props.service == "") {
			return <div> Select a Service </div>
		}

		var items = _.map(this.props.objects, obj=>{
			return <ObjectNode key={obj} path={obj} />
		});

		return <div style={{display:"flex", flexFlow: "column nowrap"}}>
			<div style={{display: "flex", flex: "0 auto", flexFlow: "row nowrap"}}>
				<div style={{flex: "1 100%"}}>
					<table>
						<tbody>
							<tr><td><b>Name:</b></td><td>{this.props.service}</td></tr>
						</tbody>
					</table>
				</div>

				<div style={{flex: "0 auto", alignSelf: "center"}}>
					<button onClick={()=>actions.setService(this.props.service)}>Refresh</button>
				</div>
			</div>

			<div style={{flex: "1 100%", padding: 8}}>
				{items}
			</div>
		</div>
	}
}


export default connectToStores(ObjectInspector)
