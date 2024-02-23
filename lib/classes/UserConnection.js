import BaseConnection from "./BaseConnection.js"
import { decodeInvite, encodeInvite } from "../encoding.js"

export default class User extends BaseConnection {
	constructor() {
		super()
		this.connection = new RTCPeerConnection(this.config)
	}

	acceptInvite(code) {
		// Keep track of information included in invite
		let id = undefined
		let candidates = undefined
		// Decode Invite (remote description + candidates)
		return decodeInvite(code)
			// Set remote description
			.then(invite => {
				id = invite.id
				candidates = invite.candidates
				const offer = {
					type: "offer",
					sdp: invite.sdp
				}
				return this.connection.setRemoteDescription(offer)
			})
			// Initialize answer + candidate gathering
			.then(() => {
				const answerPromise = this.connection.createAnswer()
					.then(answer => this.connection.setLocalDescription(answer))	// Without this the candidate gathering WILL NOT START -> Has to happen here and not after Promise.all!
					.then(() => this.connection.localDescription)
				const candidatePromise = BaseConnection.awaitCandidates(this.connection)
				return Promise.all([answerPromise, candidatePromise])
			})
			// Await answer + candidates
			.then(results => {
				const [answer, candidates] = results
				// Encode Accept (description + candidates)
				const accept = {
					id: id,
					sdp: answer.sdp,
					candidates: candidates	// These are quite large -> Which fields are actually required?
				}
				return accept
			})
			.then(accept => encodeInvite(accept))	// Todo: Invite & Accept are encoded the same way -> no extra methods needed
			// Todo: When can this.connection.addIceCandidate() be called?
	}
}