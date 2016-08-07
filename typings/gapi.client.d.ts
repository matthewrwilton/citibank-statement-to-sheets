// Typings for the Google Drive & Sheets APIs.

declare namespace gapi.client {
    export var drive: GapiClientDrive;
    export var sheets: any;

    export function load(discoveryUrl: string); // See Step 2 at https://developers.google.com/sheets/quickstart/js
}

declare interface GapiClientDrive {
    about: any;
    changes: any;
    channels: any;
    comments: any;
    files: GapiClientDriveFiles;
    permissions: any;
    replies: any;
    revisions: any;
}

declare interface GapiClientDriveFiles {
    copy(parameters: any): any;
    create(parameters: any): any;
    delete(parameters: any): any;
    emptyTrash(parameters: any): any;
    export(parameters: any): any;
    generateIds(parameters: any): any;
    get(parameters: any): any;
    list(parameters: GapiClientDriveFilesListParameters): Promise<GapiResponseWrapper<GapiClientDriveFilesListResult>>;
    update(parameters: any): any;
    watch(parameters: any): any;
}

declare interface GapiClientDriveFilesListParameters {
    corpus?: string;
    orderBy?: string;
    pageSize?: number;
    pageToken?: string;
    q?: string;
    spaces?: string;
}

declare interface GapiClientDriveFilesListResult {
    kind: string;
    nextPageToken: string;
    files: GapiClientDriveFile[];
}

declare interface GapiClientDriveFile {
    id: string;
    name: string;
}

declare interface GapiResponseWrapper<T> {
    result: T;
}