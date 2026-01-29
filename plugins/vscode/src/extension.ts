import * as vscode from 'vscode';
import * as os from 'os';

let statusBarItem: vscode.StatusBarItem;
let terminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Pigbot extension is now active');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'pigbot.connect';
    // statusBarItem.text = '$(plug) Pigbot - Not connected (click to connect)';
    statusBarItem.text = '$(plug) Pigbot';
    statusBarItem.tooltip = 'Click to connect to Pigbot';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register connect command
    let connectCommand = vscode.commands.registerCommand('pigbot.connect', async () => {
        await connect();
    });
    context.subscriptions.push(connectCommand);

    // Check auto-connect setting
    const config = vscode.workspace.getConfiguration('pigbot');
    const autoConnect = config.get<boolean>('autoConnect', false);

    if (autoConnect) {
        // Auto-connect on startup
        setTimeout(() => {
            connect();
        }, 1000); // Small delay to ensure everything is initialized
    }

    // Listen for terminal close events
    vscode.window.onDidCloseTerminal((closedTerminal) => {
        if (terminal && closedTerminal === terminal) {
            terminal = undefined;
            statusBarItem.text = '$(plug) Pigbot';
            statusBarItem.tooltip = 'Click to connect to Pigbot';
        }
    });
}

async function connect() {
    try {
        // Update status to connecting
        statusBarItem.text = '$(sync~spin) Connecting...';
        statusBarItem.tooltip = 'Connection in progress';

        // Detect OS
        const platform = os.platform();
        const isWindows = platform === 'win32';

        // Determine command based on OS
        // const command = isWindows ? 'wsl clawdbot status' : 'clawdbot status';
        const command = isWindows ? 'pigbot status' : 'pigbot status';

        // Create or reuse terminal
        if (!terminal) {
            terminal = vscode.window.createTerminal('Pigbot');
        }

        // Show terminal and send command
        terminal.show(true); // true = preserve focus
        terminal.sendText(command);

        // Update status to connected
        statusBarItem.text = '$(check) Pigbot';
        statusBarItem.tooltip = 'Connected to Pigbot';

        vscode.window.showInformationMessage('Connected to Pigbot');
    } catch (error) {
        statusBarItem.text = '$(plug) Pigbot';
        statusBarItem.tooltip = 'Click to connect to Pigbot';
        vscode.window.showErrorMessage(`Failed to connect: ${error}`);
    }
}

export function deactivate() {
    if (terminal) {
        terminal.dispose();
    }
}
