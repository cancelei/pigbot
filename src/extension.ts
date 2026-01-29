import * as vscode from 'vscode';
import * as os from 'os';

let statusBarItem: vscode.StatusBarItem;
let terminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Moltbot extension is now active');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'moltbot.connect';
    // statusBarItem.text = '$(plug) Moltbot - Not connected (click to connect)';
    statusBarItem.text = '$(plug) Moltbot';
    statusBarItem.tooltip = 'Click to connect to Moltbot';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register connect command
    let connectCommand = vscode.commands.registerCommand('moltbot.connect', async () => {
        await connect();
    });
    context.subscriptions.push(connectCommand);

    // Check auto-connect setting
    const config = vscode.workspace.getConfiguration('moltbot');
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
            statusBarItem.text = '$(plug) Moltbot';
            statusBarItem.tooltip = 'Click to connect to Moltbot';
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
        const command = isWindows ? 'moltbot status' : 'moltbot status';

        // Create or reuse terminal
        if (!terminal) {
            terminal = vscode.window.createTerminal('Moltbot');
        }

        // Show terminal and send command
        terminal.show(true); // true = preserve focus
        terminal.sendText(command);

        // Update status to connected
        statusBarItem.text = '$(check) Moltbot';
        statusBarItem.tooltip = 'Connected to Moltbot';

        vscode.window.showInformationMessage('Connected to Moltbot');
    } catch (error) {
        statusBarItem.text = '$(plug) Moltbot';
        statusBarItem.tooltip = 'Click to connect to Moltbot';
        vscode.window.showErrorMessage(`Failed to connect: ${error}`);
    }
}

export function deactivate() {
    if (terminal) {
        terminal.dispose();
    }
}
