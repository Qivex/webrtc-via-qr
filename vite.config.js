import { defineConfig } from "vite"

export default defineConfig({
	publicDir: "static",
	build: {
		assetsDir: "bundle",
		rollupOptions: {
			input: {
				"host": "example/host.html",
				"join": "example/join.html"
			}
		}
	},
	define: {
		__BUILD_TIMESTAMP__: JSON.stringify(Date.now())
	}
})