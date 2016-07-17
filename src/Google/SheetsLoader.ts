export default class SheetsLoader {
    public load(): Promise<any> {
        return this.loadDriveApi()
            .then(() => {
                var request = gapi.client.drive.files.list({
                        pageSize: 10,
                        q: "mimeType='application/vnd.google-apps.spreadsheet'"
                    });
                
                return new Promise<any>((resolve, reject) => {
                    request.execute((resp) => {
                        resolve(resp.files);
                    });
                });
            });
    }

    private loadDriveApi(): Promise<void> {
        return gapi.client.load('drive', 'v3');
    }
}