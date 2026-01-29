"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
let statusBarItem;
let terminal;
function activate(context) {
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
    const autoConnect = config.get('autoConnect', false);
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
exports.activate = activate;
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
    }
    catch (error) {
        statusBarItem.text = '$(plug) Moltbot';
        statusBarItem.tooltip = 'Click to connect to Moltbot';
        vscode.window.showErrorMessage(`Failed to connect: ${error}`);
    }
}
function deactivate() {
    if (terminal) {
        terminal.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map