import { connect, RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import WorkingSchedule from "./entrypoints/WorkingSchedule";
import { render } from "./utils/render";

// Check if we're running inside an iframe (DatoCMS environment)
const isInsideIframe = window.self !== window.top;

if (isInsideIframe) {
	connect({
		manualFieldExtensions() {
			return [
				{
					id: "workingScheduleDays",
					name: "Working Schedule Days",
					type: "editor",
					fieldTypes: ["json"],
					configurable: false,
				},
			];
		},
		renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
			if (fieldExtensionId === "workingScheduleDays") {
				return render(<WorkingSchedule ctx={ctx} />);
			}
		},
	});
} else {
	// Development mode - show a helpful message
	render(
		<div style={{
			padding: "40px",
			maxWidth: "600px",
			margin: "0 auto",
			fontFamily: "system-ui, sans-serif"
		}}>
			<h1>🔌 DatoCMS Plugin Development</h1>
			<p>This plugin is running in development mode.</p>
			<p>To test it properly, you need to:</p>
			<ol>
				<li>Build the plugin: <code>npm run build</code></li>
				<li>Open your DatoCMS project settings</li>
				<li>Go to <strong>Settings → Plugins</strong></li>
				<li>Add a new plugin using this local URL or deploy it</li>
				<li>Create a JSON field and assign this editor to it</li>
			</ol>
			<p>
				<strong>Plugin ID:</strong> <code>workingScheduleDays</code><br />
				<strong>Field Types:</strong> JSON
			</p>
		</div>
	);
}
