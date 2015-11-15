import alt from "./alt"

class InspectorActions {
	constructor() {
		this.generateActions(
			"setBus",
			"setService",
			"fetchServices",
			"fetchServicesCompleted",
			"networkFailure",
			"fetchObjects",
			"fetchObjectsCompleted",
			"fetchInterfaces",
			"fetchInterfacesCompleted"
		)
	}
}


export default alt.createActions(InspectorActions)
