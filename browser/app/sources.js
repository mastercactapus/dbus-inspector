import reqwest from "reqwest"
import actions from "./actions"
import nanoajax from "nanoajax"

function enc(str) {
	return encodeURIComponent(str);
}

function ajax(url) {
	return new Promise(function(resolve, reject){
		nanoajax.ajax({url}, function(code, res){
			if (code !== 200) {
				reject(res)
				return
			}

			resolve(JSON.parse(res))
		})
	})
}

export default {
	services: {
		remote(state, bus) {
			return ajax("/api/bus/" + enc(bus))
		},

		success: actions.fetchServicesCompleted,
		error: actions.networkFailure
	},
	objects: {
		remote(state, service) {
			return ajax("/api/bus/" + enc(state.bus) + "/" + enc(service))
		},

		success: actions.fetchObjectsCompleted,
		error: actions.networkFailure
	},
	interfaces: {
		remote(state, objectPath) {
			return ajax("/api/bus/" + enc(state.bus) + "/" + enc(state.service) + "/interfaces?objectPath=" + enc(objectPath))
			.then(function(data){
				return {
					objectPath,
					interfaces: data.Interfaces
				}
			})
		},

		success: actions.fetchInterfacesCompleted,
		error: actions.networkFailure
	}
}
