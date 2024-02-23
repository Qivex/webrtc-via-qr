const config = {
	iceServers: [
		{urls:"stun:stun.l.google.com:19302"}
	]
}

export default class BaseConnection {
	static awaitCandidates(con) {
		return new Promise((resolve, reject) => {
			const candidates = []
			// Collect candidates
			con.addEventListener("icecandidate", e => {
				if (e.candidate != null) {
					candidates.push(e.candidate)
				}
			})
			// Resolve when all candidates are gathered
			con.addEventListener("icegatheringstatechange", e => {
				if (e.target.iceGatheringState === "complete") {
					resolve(candidates)
				}
			})
		})
	}

	constructor() {
		this.config = config
		this.handlers = {
			connect: () => {},
			message: () => {}
		}
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