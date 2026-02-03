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

// Plugin to transform sidepanel.html script path
function transformHtmlPlugin() {
	return {
		name: "transform-html",
		writeBundle(options) {
			const htmlPath = path.join(options.dir, "sidepanel.html");
			if (fs.existsSync(htmlPath)) {
				let html = fs.readFileSync(htmlPath, "utf-8");
				// Replace the dev script path with the built script path
				html = html.replace(
					/<script type="module" src="src\/ui\/index\.js"><\/script>/,
					'<script type="module" src="sidepanel.js"></script>',
				);
				fs.writeFileSync(htmlPath, html);
				console.log("Transformed sidepanel.html script path");
			}
		},
	};
}

export default defineConfig(({ mode }) => {
	const browser = getBrowser(mode);
	const outDir = `dist/${browser}`;

	const getInput = () => {
		if (process.env.VITE_INPUT === "background") {
			return { background: path.resolve(__dirname, "src/background/index.js") };
		}
		if (process.env.VITE_INPUT === "content") {
			return { content: path.resolve(__dirname, "src/content/index.js") };
		}
		return { sidepanel: path.resolve(__dirname, "src/ui/index.js") };
	};

	const isScript =
		process.env.VITE_INPUT === "background" ||
		process.env.VITE_INPUT === "content";

	return {
		root: path.resolve(__dirname),
		publicDir: "public",
		plugins: [generateManifestPlugin(browser), transformHtmlPlugin()],
		build: {
			outDir,
			emptyOutDir: false,
			rollupOptions: {
				input: getInput(),
				output: {
					format: isScript ? "iife" : "esm",
					entryFileNames: "[name].js",
					inlineDynamicImports: isScript,
					assetFileNames: (assetInfo) => {
						if (assetInfo.name.endsWith(".css")) return "styles.css";
						return "assets/[name]-[hash][extname]";
					},
				},
			},
		},
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
