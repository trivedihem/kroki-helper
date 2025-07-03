// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as diagramGeneratorModule from './diagramGenerator.js';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "kroki-helper" is now active!');
  
	const disposable1 = vscode.commands.registerCommand('kroki-helper.sayHello', () => {
    vscode.window.showInformationMessage('Hello from the context menu!');
  }); 

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable2 = vscode.commands.registerCommand('kroki-helper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from kroki-helper!');
	});

	context.subscriptions.push(disposable1);

	const disposable3 = vscode.commands.registerCommand('kroki-helper.svg', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}
		const document = editor.document;
		const cursorLine = editor.selection.active.line; // 0-based line number where the cursor is
		const selectedText = document.getText();
		if (!selectedText.trim()) {
			vscode.window.showWarningMessage('The document is empty.');
			return;
		}

		try {
			//const a = diagramGenerator11.DiagramGenerator;
			//const diagramGeneratorModule = await import('./diagramGenerator.ts');
			const generator = new diagramGeneratorModule.DiagramGenerator();
			const svgs = await generator.generate({format:'svg', code:selectedText, line:cursorLine});

			const panel = vscode.window.createWebviewPanel(
				'Preview',
				'Preview',
				vscode.ViewColumn.Beside,
				{}
			);

			const svgHtml = Array.isArray(svgs)
				? svgs.map((svg: Buffer, idx: number) => `<div style="margin-bottom:24px;"><h3>Diagram ${idx + 1}</h3>${svg.toString('utf8')}</div>`).join('')
				: `<div>${(svgs as Buffer).toString('utf8')}</div>`;

			panel.webview.html = `<html><body>${svgHtml}</body></html>`;
		} catch (error: any) {
			vscode.window.showErrorMessage(`Failed to generate svg diagram: ${error.message}`);
		}
	});
	const disposable4 = vscode.commands.registerCommand('kroki-helper.pdf', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}
		const document = editor.document;
		const cursorLine = editor.selection.active.line;
		const selectedText = document.getText();
		if (!selectedText.trim()) {
			vscode.window.showWarningMessage('The document is empty.');
			return;
		}

		try {
			const generator = new diagramGeneratorModule.DiagramGenerator();
			const pdfs = await generator.generate({ format: 'pdf', code: selectedText, line: cursorLine });

			const saveUri = await vscode.window.showSaveDialog({
				filters: { 'PDF Files': ['pdf'] },
				defaultUri: vscode.Uri.file('diagram.pdf'),
				saveLabel: 'Save PDF'
			});
			if (!saveUri) {
				return;
			}

			const pdfBuffer = Array.isArray(pdfs) ? pdfs[0] : pdfs as Buffer;
			await vscode.workspace.fs.writeFile(saveUri, pdfBuffer);

			const panel = vscode.window.createWebviewPanel(
				'Preview',
				'PDF Preview',
				vscode.ViewColumn.Beside,
				{}
			);

			panel.webview.html = `
				<html>
					<body style="margin:0;padding:0;">
						<embed src="${panel.webview.asWebviewUri(saveUri)}" type="application/pdf" width="100%" height="100%" style="min-height:80vh;" />
						<p><a href="${panel.webview.asWebviewUri(saveUri)}" download="diagram.pdf">Download PDF</a></p>
					</body>
				</html>
			`;
		} catch (error: any) {
			vscode.window.showErrorMessage(`Failed to generate or save pdf diagram: ${error.message}`);
		}
	});
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
