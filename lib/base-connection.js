export default class BaseConnection {
	constructor() {
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