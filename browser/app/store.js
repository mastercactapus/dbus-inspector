import alt from "./alt"
import _ from "lodash"
import actions from "./actions"
import sources from "./sources"

class InspectorStore {
	constructor() {
		this.bindActions(actions)
		this.state = {
			bus: "system",
			services: [],
			service: "",
			objects: [],
			interfaces: {}
		}
		this.registerAsync(sources)
	}

	onSetBus(bus) {
		if (this.state.bus != bus) {
			this.setState({bus,
				services: [],
				service: "",
				objects: []
			});
		}
		this.getInstance().services(bus)
	}

	onFetchServicesCompleted(services) {
		this.setState({services})
	}

	onSetService(service) {
		if (this.state.service != service) {
			this.setState({service, objects: []})
		}
		this.getInstance().objects(service)
	}

	onFetchObjectsCompleted(objects) {
		this.setState({objects})
	}

	onFetchInterfaces(path) {
		this.getInstance().interfaces(path)
	}

	onFetchInterfacesCompleted(data) {
		this.setState({
			interfaces: _.defaults({[data.objectPath]: data.interfaces}, this.state.interfaces)
		})
	}
}

export default alt.createStore(InspectorStore)
