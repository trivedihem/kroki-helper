import * as vscode from 'vscode';

export interface DiagramOptions {
    code: string;
    line: number; // 0-based line number where the cursor is
    format: 'svg' | 'png' | 'pdf';
    serverUrl?: string;
}

function getAllPlantumlBlocks(text: string): string[] {
    const lines = text.split('\n');
    let insideBlock = false;
    let blockLines: string[] = [];
    const blocks: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (trimmed === '@startuml') {
            insideBlock = true;
            blockLines = [];
        } else if (trimmed === '@enduml' && insideBlock) {
            insideBlock = false;
            blocks.push(blockLines.join('\n'));
        } else if (insideBlock) {
            blockLines.push(lines[i]);
        }
    }
    return blocks;
}

function getAllMermaidBlocks(text: string): string[] {
    const lines = text.split('\n');
    let insideBlock = false;
    let blockLines: string[] = [];
    const blocks: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (trimmed === '```mermaid') {
            insideBlock = true;
            blockLines = [];
        } else if (trimmed === '```' && insideBlock) {
            insideBlock = false;
            blocks.push(blockLines.join('\n'));
        } else if (insideBlock) {
            blockLines.push(lines[i]);
        }
    }

    return blocks;
}

export class DiagramGenerator {
    private serverUrl: string;

    constructor(serverUrl?: string) {
        const configServerUrl = vscode.workspace.getConfiguration("kroki-helper").get<string>("serverUrl");
        this.serverUrl = serverUrl || configServerUrl || 'https://kroki.io';
        this.serverUrl = this.serverUrl.replace(/\/$/, '');
    }

    async generate(options: DiagramOptions): Promise<Buffer[]> {
        const { code, format = 'svg', serverUrl } = options;
        let blocks: string[] = [];
        // Collect all blocks by type
        const blockMap: Record<string, string[]> = {
            plantuml: getAllPlantumlBlocks(code),
            mermaid: getAllMermaidBlocks(code)
        };
        const effectiveServerUrl = serverUrl || this.serverUrl;
        const results: Buffer[] = [];

    // Process each type of block
    for (const [type, blocks] of Object.entries(blockMap)) {
        if (!blocks || !blocks.length) continue;

        const url = `${effectiveServerUrl}/${type}/${format}`;

        for (const block of blocks) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: block,
                });

                if (!response.ok) {
                    throw new Error(`Failed to generate diagram for type "${type}": ${response.status} ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                results.push(Buffer.from(arrayBuffer));
            } catch (err) {
                console.error(`Error processing block of type "${type}":`, err);
                throw err; // rethrow or handle gracefully
            }
        }
    }
    return results;
    }
}

export default DiagramGenerator;
