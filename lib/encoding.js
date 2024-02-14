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

function encodeInvite(invite) {
	return new Promise((resolve, reject) => {
		const inviteString = JSON.stringify(invite)
		console.log(inviteString.length)
		compressBlob(new Blob([inviteString]), "gzip")
			.then(blob => {
				
				blobToBase64a(blob).then(str => console.log(str))
				blobToBase64b(blob).then(str => console.log(str))
			})
	})
}

function decodeInvite() {}

function encodeAccept() {}

function decodeAccept() {}

export {
	encodeInvite,
	decodeInvite,
	encodeAccept,
	decodeAccept
}