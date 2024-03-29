const GATHERING_TIMEOUT = 1000
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
		// Setup event handlers
		this.connection.addEventListener("datachannel", e => {
			this.receiveChannel = e.channel
			this.receiveChannel.addEventListener("message", e => {
				this.handlers.message(this, e)	// Todo: Params should be (userID, messageString)
			})
			this.handlers.connect(this, e.channel)
		})
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
			// Failsafe: Resolve a few seconds after no (more) candidate was gathered
			setTimeout(() => resolve(candidates), GATHERING_TIMEOUT)
			// Todo: Do these EventListeners have to be removed?
		})
	}

	setRemoteCandidates(candidates) {
		let promises = []
		for (let candidate of candidates) {
			promises.push(this.connection.addIceCandidate(candidate))
		}
		return Promise.all(promises)
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