import * as vscode from 'vscode';
const yaml = require('js-yaml');

export function activate({ subscriptions }: vscode.ExtensionContext) {

	// register a content provider for the cowsay-scheme
	const myScheme = 'previewyaml';
	const myProvider = new class implements vscode.TextDocumentContentProvider {

		// emitter and its event
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;

		async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
			console.log(uri);
			// simply invoke cowsay, use uri-path as text
			let document = await vscode.workspace.openTextDocument(uri.path.slice(0, -5));
			let text = document.getText();
			console.log(text);
			let docs = yaml.safeLoadAll(text).map((doc: object) => JSON.stringify(doc,null,4));
			return docs.join("\n");
		}
	};

	subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));

	// register a command that opens a cowsay-document
	subscriptions.push(vscode.commands.registerCommand('previewyaml.previewyaml', async () => {
		if (vscode.window.activeTextEditor){
			console.log("active");
			const currentFile = vscode.window.activeTextEditor.document.uri.fsPath;
			console.log(currentFile);
			let uri = vscode.Uri.parse('previewyaml:' + currentFile + ".json");
			let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
			await vscode.window.showTextDocument(doc, { preview: false });
		}
			
	}));
}