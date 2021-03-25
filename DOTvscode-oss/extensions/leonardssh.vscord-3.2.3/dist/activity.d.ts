import { Disposable, TextDocumentChangeEvent, TextEditor, TextDocument, WindowState, ConfigurationChangeEvent } from 'vscode';
import type { Client } from './client';
export declare function resolveIcon(document: TextDocument): string;
export declare class Activity implements Disposable {
    private readonly client;
    private presence;
    private debugging;
    private viewing;
    private problems;
    constructor(client: Client);
    init(): Promise<void>;
    onFileSwitch(editor: TextEditor): Promise<void>;
    onFileEdit({ document }: TextDocumentChangeEvent): Promise<void>;
    onChangeWindowState({ focused }: WindowState): Promise<void>;
    toggleDebug(): void;
    onDiagnosticsChange(): void;
    onConfigChange(e: ConfigurationChangeEvent): Promise<void>;
    dispose(): void;
    idle(status: boolean): Promise<void>;
    private generateDetails;
    private generateFileDetails;
    private update;
}
//# sourceMappingURL=activity.d.ts.map