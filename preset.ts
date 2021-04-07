import { Preset, color } from "apply";

const moduleScript = `<script context="module">
	export const load = async({ fetch }) => {
		const query = \`
			query Doubled($x: Int) {
				double(number: $x)
			}
		\`;

		const variables = {
			x: 19,
		};

		const response = await fetch("/graphql", {
			body: JSON.stringify({ query, variables }),
			headers: {
				"Authorization": "Token ABC123",
				"Content-Type": "application/json",
			},
			method: "POST",
		});

		const { data, errors } = await response.json();

		if (errors) return {
			error: new Error(errors.map(({ message }) => message).join("\\n")),
			status: 500,
		};

		return {
			props: {
				doubled: data.double,
			},
		};
	}
</script>
`;


Preset.setName("svelte-add/graphql");

const EXCLUDE_EXAMPLES = "excludeExamples";
Preset.option(EXCLUDE_EXAMPLES, false);

Preset.extract().withTitle("Adding GraphQL endpoint and schema");

Preset.editNodePackages().addDev("graphql", "^15.5.0").withTitle("Installing `graphql`");
Preset.editNodePackages().addDev("graphql-helix", "^1.2.3").withTitle("Installing `graphql-helix`");

Preset.group((preset) => {
	preset.edit(["src/routes/index.svelte"]).update((contents) => `${moduleScript}${contents}`).withTitle("Add preload function");
	
	preset.edit(["src/routes/index.svelte"]).update((contents) => {
		const import_ = "import Counter from '$lib/Counter.svelte';";
		return contents.replace(import_, `${import_}\n\texport let doubled;`);
	}).withTitle("Ask for prop from preload");
	
	preset.edit(["src/routes/index.svelte"]).update((contents) => {
		const h1 = "<h1>Hello world!</h1>";
		return contents.replace(h1, `${h1}\n\t<h2>The API said {doubled}</h2>`);
	}).withTitle("Show preloaded data in the markup");
	
	preset.edit(["src/routes/index.svelte"]).update((contents) => {
		const p = `<p>Visit the <a href="https://svelte.dev">svelte.dev</a> to learn how to build Svelte apps.</p>`;
		return contents.replace(p, `${p}\n\t<p>Visit <a href="/graphql">GraphiQL</a> to explore the API.</p>`);
	}).withTitle("Add a link to GraphiQL on the homepage");
}).withTitle("Showing how to query the GraphQL API").ifNotOption(EXCLUDE_EXAMPLES);

Preset.instruct(`Run ${color.magenta("npm install")}, ${color.magenta("pnpm install")}, or ${color.magenta("yarn")} to install dependencies`);
