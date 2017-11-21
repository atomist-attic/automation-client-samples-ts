import {
    CommandHandler,
    HandleCommand,
    HandlerContext,
} from "@atomist/automation-client";

/**
 * HelloChannel
 *
 * one of the simplest possible command handlers.
 * If you say "marco" in any channel, Atomist will say "polo" in #random.
 *
 * This will only work if Atomist has been invited to #random.
 * Type `/invite @Atomist` in #random to accomplish this.
 *
 */
@CommandHandler("Sends a message to #random", "marco")
export class HelloChannel implements HandleCommand {

    public handle(context: HandlerContext): Promise<void> {

        return context.messageClient.addressChannels("polo", "random");
    }
}
