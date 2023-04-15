/* eslint-disable @typescript-eslint/member-ordering */
export default class LocalConfiguration {
    static get token() {
        return "Bot [TOKEN]";
    }

    static get webhook() {
        return {
            id:    "",
            token: ""
        };
    }

    static get githubToken() {
        return "";
    }
}
