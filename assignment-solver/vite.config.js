import { defineConfig } from "vite";
import { generateManifest } from "./manifest.config.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get browser target from mode (chrome or firefox)
const getBrowser = (mode) => {
	if (mode === "firefox") return "firefox";
	return "chrome";
};

// Plugin to generate manifest.json
function generateManifestPlugin(browser) {
	return {
		name: "generate-manifest",
		buildStart() {
			// Generate manifest will be written in writeBundle
		},
		writeBundle(options) {
			const manifest = generateManifest(browser);
			const manifestPath = path.join(options.dir, "manifest.json");
			fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
			console.log(`Generated manifest.json for ${browser}`);
		},
	};
}

export default defineConfig(({ mode }) => {
	const browser = getBrowser(mode);
	const outDir = `dist/${browser}`;

	return {
		root: path.resolve(__dirname),
		publicDir: "public",
		build: {
			outDir,
			emptyOutDir: true,
			rollupOptions: {
				input: {
					// Entry points for the extension
					background: path.resolve(__dirname, "src/background/index.js"),
					content: path.resolve(__dirname, "src/content/index.js"),
					sidepanel: path.resolve(__dirname, "src/ui/index.js"),
				},
				output: {
					entryFileNames: (chunkInfo) => {
						// Preserve directory structure
						if (chunkInfo.name === "background") return "background.js";
						if (chunkInfo.name === "content") return "content.js";
						if (chunkInfo.name === "sidepanel") return "sidepanel.js";
						return "[name].js";
					},
					chunkFileNames: "chunks/[name]-[hash].js",
					assetFileNames: (assetInfo) => {
						if (assetInfo.name.endsWith(".css")) return "styles.css";
						return "assets/[name]-[hash][extname]";
					},
				},
			},
		},
		plugins: [generateManifestPlugin(browser)],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
				"@core": path.resolve(__dirname, "src/core"),
				"@platform": path.resolve(__dirname, "src/platform"),
				"@services": path.resolve(__dirname, "src/services"),
				"@background": path.resolve(__dirname, "src/background"),
				"@ui": path.resolve(__dirname, "src/ui"),
				"@content": path.resolve(__dirname, "src/content"),
			},
		},
		define: {
			__BROWSER__: JSON.stringify(browser),
			__VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
		},
	};
});
