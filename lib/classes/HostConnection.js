import BaseConnection from "./BaseConnection.js"
import { decodeInvite, encodeInvite } from "../encoding.js"

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
		// Keep track of information included in accept
		let id = undefined
		let candidates = undefined
		// Decode accept (remote description + candidates)
		decodeInvite(code)
			.then(accept => {
				id = accept.id
				candidates = accept.candidates
				const answer = {
					type: "answer",
					sdp: accept.sdp
				}
				// Set remote description
				return this.connection.setRemoteDescription(answer)
			})
			.then(() => {
				// Add candidates
				for (let c of candidates) {
					this.connection.addIceCandidate(c)
				}
			})
	}
}