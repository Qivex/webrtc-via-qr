import BaseConnection from "./BaseConnection.js"
import { decodeInvite, encodeInvite } from "../encoding.js"

export default class Host extends BaseConnection {
	constructor() {
		super()
	}

	createInvite() {
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
				return encodeInvite({
					sdp: offer.sdp,
					candidates: candidates
				})
			})
	}

	confirmAccept(code) {
		// Keep track of information included in accept
		let candidates = undefined
		// Decode accept (remote description + candidates)
		decodeInvite(code)
			.then(accept => {
				candidates = accept.candidates
				const answer = {
					type: "answer",
					sdp: accept.sdp
				}
				// Set remote description
				return this.connection.setRemoteDescription(answer)
			})
			.then(() => {
				this.setRemoteCandidates(candidates)	// Can only be done AFTER remote description was set
			})
	}
}