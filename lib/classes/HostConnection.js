import BaseConnection from "./BaseConnection.js"
import { encodeInvite } from "../encoding.js"

export default class Host extends BaseConnection {
	constructor() {
		super()
	}

	createInvite(id) {
		// Initialize offer + candidate gathering
		const offerPromise = this.connection.createOffer()
			.then(offer => this.connection.setLocalDescription(offer))	// Without this the candidate gathering WILL NOT START -> Has to happen here and not after Promise.all!
			.then(() => this.connection.localDescription)
		const candidatePromise = this.awaitCandidates()
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