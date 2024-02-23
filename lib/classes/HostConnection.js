import BaseConnection from "./BaseConnection.js"
import { encodeInvite } from "../encoding.js"

export default class Host extends BaseConnection {
	constructor() {
		super()
		this.connections = []
		/* Todo:
		A class called "Connection" should only handle one connection - otherwise it will be confusing.
		For broadcast etc the host might use a "HostConnectionCollection" or whatever
		*/
	}

	createInvite() {
		// Create new connection
		let con = new RTCPeerConnection(this.config)
		con.createDataChannel("testchannel")
		this.connections.push(con)
		let id = this.connections.indexOf(con)
		// Initialize offer + candidate gathering
		const offerPromise = con.createOffer()
			.then(offer => con.setLocalDescription(offer))	// Without this the candidate gathering WILL NOT START -> Has to happen here and not after Promise.all!
			.then(() => con.localDescription)
		const candidatePromise = BaseConnection.awaitCandidates(con)
		// Await offer + candidates
		return Promise.all([offerPromise, candidatePromise])
			.then(results => {
				const [offer, candidates] = results
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