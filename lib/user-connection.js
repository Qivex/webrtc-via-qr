import BaseConnection from "./base-connection.js";

export default class User extends BaseConnection {
	constructor() {
		super()
	}

	acceptInvite(code) {
		// Decode Invite (remote description + candidates)
		// Set remote description
		// Add candidates

		// Get & set own description
		// Await candidates
		// Encode accept (own description + candidates)
	}
}