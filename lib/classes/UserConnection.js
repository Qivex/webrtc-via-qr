import BaseConnection from "./BaseConnection.js"
import { decodeInvite, encodeInvite } from "../encoding.js"

export default class User extends BaseConnection {
	constructor() {
		super()
	}

	acceptInvite(code) {
		// Keep track of information included in invite
		let candidates = undefined
		// Decode Invite (remote description + candidates)
		return decodeInvite(code)
			// Set remote description
			.then(invite => {
				candidates = invite.candidates
				const offer = {
					type: "offer",
					sdp: invite.sdp
				}
				return this.connection.setRemoteDescription(offer)
			})
			.then(() => this.setRemoteCandidates(candidates))	// Can only be done AFTER remote description was set
			.then(() => {
				// Initialize answer + candidate gathering
				const answerPromise = this.connection.createAnswer()
					.then(answer => this.connection.setLocalDescription(answer))	// Without this the candidate gathering WILL NOT START -> Has to happen here and not after Promise.all!
					.then(() => this.connection.localDescription)
				const candidatePromise = this.awaitCandidates()
				return Promise.all([answerPromise, candidatePromise])
			})
			// Await answer + candidates
			.then(results => {
				const [answer, candidates] = results
				// Encode Accept (description + candidates)
				return encodeInvite({
					sdp: answer.sdp,
					candidates: candidates	// These are quite large -> Which fields are actually required?
				})
			})
	}
}