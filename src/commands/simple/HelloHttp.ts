import {
    CommandHandler,
    HandleCommand,
    HandlerContext,
    HandlerResult, success, Success,
} from "@atomist/automation-client";
import axios from "axios";
/**
 * HelloHttp
 *
 * Make an HTTP request.
 *
 */
@CommandHandler("Send an HTTP request and report the response", "where is this running")
export class HelloHttp implements HandleCommand {

    public handle(context: HandlerContext): Promise<HandlerResult> {

        // The `axios` TypeScript library handles HTTP requests. It returns a Promise of a response.
        // Axios parses JSON (or XML) into JavaScript objects into the `data` field on the response.
        return axios.get("http://icanhazip.com/")
            .then(response => context.messageClient.respond("My IP is: " + response.data))
            .then(success);
    }
}
