import AuthorisationResult from "./AuthorisationResult";

export default class Authoriser {
    constructor(
        private handleAuthorisation: (result: AuthorisationResult) => void,
        private bindTarget: any) {
    } 

    public authorise() {
        gapi.auth.authorize(
            {
                client_id: "572433782727-t18lsk18p4bgp272rjsadqtqdl06d37n.apps.googleusercontent.com",
                scope: "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/spreadsheets",
                immediate: false
            }, (result) => { this.authoriseCallback(result) }
        );
    }

    private authoriseCallback(result: GoogleApiOAuth2TokenObject) {
        let authorised = result.access_token !== undefined;
        this.handleAuthorisation.bind(this.bindTarget)(new AuthorisationResult(authorised, result.error));
    }
}
