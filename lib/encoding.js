const AVAILABLE_COMPRESSION_METHODS = ["gzip", "deflate", "deflate-raw"]
const DATA_URL_PREFIX = "data:application/octet-stream;base64,"

// Inspired by https://dev.to/samternent/json-compression-in-the-browser-with-gzip-and-the-compression-streams-api-4135
function pipeBlobThrough(blob, transformStream) {
	return new Response(blob.stream().pipeThrough(transformStream)).blob()
}

function compressBlob(blob, method) {
	return pipeBlobThrough(blob, new CompressionStream(method))
}

function uncompressBlob(blob, method) {
	return pipeBlobThrough(blob, new DecompressionStream(method))
}

// From https://stackoverflow.com/a/18650249
function blobToBase64a(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = () => {
			const result = reader.result
			resolve(result.substring(result.indexOf(",") + 1))
		}
		reader.readAsDataURL(blob)
	})
}

// From https://stackoverflow.com/a/11562550
function blobToBase64b(blob) {
	return new Promise((resolve, reject) => {
		blob.arrayBuffer()
			.then(buffer => resolve(btoa(String.fromCharCode(...new Uint8Array(buffer)))))
	})
}

// From https://stackoverflow.com/a/36183085
function base64ToBlob(str) {
	return new Promise((resolve, reject) => {
		fetch(DATA_URL_PREFIX + str)
			.then(res => res.blob())
			.then(blob => resolve(blob))
	})
}

function urlEncodeBase64(str) {
	// Replace reserved chars according to base64url
	let replaced = str.replaceAll("+", "-").replaceAll("/", "_")
	// Encode remaining reserved chars (should only be =)
	return encodeURIComponent(replaced)
}

function urlDecodeBase64(str) {
	let decoded = decodeURIComponent(str)
	return decoded.replaceAll("_", "/").replaceAll("-", "+")
}

function encodeInvite(invite) {
	return new Promise((resolve, reject) => {
		const inviteString = JSON.stringify(invite)
		compressBlob(new Blob([inviteString]), "deflate-raw")
			.then(blob => blobToBase64a(blob))
			.then(base64 => urlEncodeBase64(base64))
			.then(encodedInvite => resolve(encodedInvite))
	})
}

function decodeInvite(code) {
	return new Promise((resolve, reject) => {
		const base64 = urlDecodeBase64(code)
		base64ToBlob(base64)
			.then(blob => uncompressBlob(blob, "deflate-raw"))
			.then(blob => blob.text())
			.then(str => resolve(JSON.parse(str)))
	})
}

function encodeAccept() {}

function decodeAccept() {}

export {
	encodeInvite,
	decodeInvite,
	encodeAccept,
	decodeAccept
}