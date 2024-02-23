const config = {
	iceServers: [
		{urls:"stun:stun.l.google.com:19302"}
	]
}

export default class BaseConnection {
	constructor() {
		this.connection = new RTCPeerConnection(config)
		this.sendChannel = this.connection.createDataChannel("sending")
		this.receiveChannel = null
		this.handlers = {
			connect: () => {},
			message: () => {}
		}
	}

	awaitCandidates() {
		return new Promise((resolve, reject) => {
			const candidates = []
			// Collect candidates
			this.connection.addEventListener("icecandidate", e => {
				if (e.candidate != null) {
					candidates.push(e.candidate)
				}
			})
			// Resolve when all candidates are gathered
			this.connection.addEventListener("icegatheringstatechange", e => {
				if (e.target.iceGatheringState === "complete") {
					resolve(candidates)
				}
			})
			// Todo: Do these EventListeners have to be removed?
		})
	}

	on(eventname, handler) {
		if (typeof handler != "function") {
			throw TypeError("Handler must be a function!")
			return
		}
		if (!Object.hasOwn(this.handlers, eventname)) {
			throw TypeError(`Unknown Event ${eventname}!`)
			return
		}
		this.handlers[eventname] = handler
	}
}