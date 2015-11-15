import React from "react"
import store from "./store"
import actions from "./actions"
import connectToStores from "alt/utils/connectToStores"
import _ from "lodash"

class ServiceFinder extends React.Component {
	static getStores() {
		return [store]
	}

	static getPropsFromStores() {
		return store.getState()
	}

	constructor() {
		super()
		this.state = {
			filter: ""
		}
	}

	render() {
		var items = _.chain(this.props.services)
		.sortBy(svc=>{
			if (svc[0]!=":") return "_" + svc;
		})
		.filter(svc=>{
			if (this.state.filter == "") return true;

			return _.contains(svc, this.state.filter)
		})
		.map(svc =>{
			return <option key={svc} value={svc}>{svc}</option>
		})
		.value();

		return <div style={{flex: "1 100%", display: "flex", flexFlow: "column nowrap"}}>
		<div style={{flex: "0 auto", paddingBottom: 4}}>
			<input placeholder="Filter services..." value={this.state.filter} onChange={e=>{this.setState({filter: e.target.value})}} />
		</div>
		<div style={{flex: "0 100%", overflow: "auto"}}>
			<select style={{width: "100%"}} value={this.props.service||null} onChange={e=>actions.setService(e.target.value)} size={20}>
				{items}
			</select>
		</div>
		</div>
	}
}

export default connectToStores(ServiceFinder)

