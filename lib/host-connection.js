import BaseConnection from "./base-connection.js"
import { encodeInvite } from "./encoding.js"

const config = {
	iceServers: [
		{urls:"stun:stun.l.google.com:19302"}
	]
}

export default class Host extends BaseConnection {
	constructor() {
		super()
		this.connections = []
	}

	createInvite() {
		// Create new connection
		let con = new RTCPeerConnection(config)
		con.createDataChannel("testchannel")
		this.connections.push(con)
		let id = this.connections.indexOf(con)
		// Initialize offer + candidate gathering
		const offerPromise = con.createOffer()
			.then(offer => con.setLocalDescription(offer))	// Without this the candidate gathering WILL NOT START -> Has to happen here and not after Promise.all!
			.then(() => con.localDescription)
		const candidatePromise = new Promise((resolve, reject) => {
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
		// Await offer + candidates
		return Promise.all([offerPromise, candidatePromise])
			.then(results => {
				const [offer, candidates] = results
				con.setLocalDescription(offer)
				// Encode Invite (description + candidates)
				const invite = {
					id: id,
					sdp: offer.sdp,
					candidates: candidates	// These are quite large -> Which fields are actually required?
				}
				return invite
			})
			.then(invite => encodeInvite(invite))
	}

	confirmAccept(code) {
		// Decode accept (remote description + candidates)
		// Set remote description
		// Add candidates
	}
}