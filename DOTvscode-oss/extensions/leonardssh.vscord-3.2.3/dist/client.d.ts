import { Presence } from 'discord-rpc';
import type { Disposable, WorkspaceConfiguration, StatusBarItem } from 'vscode';
export declare class Client implements Disposable {
    config: WorkspaceConfiguration;
    statusBarIcon: StatusBarItem;
    private rpc?;
    private ready?;
    private readonly activity;
    private readonly listener;
    constructor(config: WorkspaceConfiguration, statusBarIcon: StatusBarItem);
    connect(): Promise<void>;
    handleTransport(): Promise<void>;
    handleReady(): Promise<void>;
    setActivity(presence: Presence): Promise<void>;
    dispose(): Promise<void>;
}
declare module 'discord-rpc' {
    interface Client {
        transport: {
            once(event: 'close', listener: () => void): void;
        };
    }
}
//# sourceMappingURL=client.d.ts.map