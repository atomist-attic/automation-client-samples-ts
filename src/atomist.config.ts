import { Configuration } from "@atomist/automation-client/configuration";
import * as appRoot from "app-root-path";
import { updateCopyrightInOneRepository } from "./commands/editor/UpdateCopyright";
import { NewAutomation } from "./commands/generator/NewAutomation";
import { ReviewCopyright } from "./commands/reviewer/ReviewCopyright";
import { HelloChannel } from "./commands/simple/HelloChannel";
import { HelloHttp } from "./commands/simple/HelloHttp";
import { HelloWorld } from "./commands/simple/HelloWorld";
import { CommentOnIssue } from "./events/CommentOnIssue";
import { NotifyOnPush } from "./events/NotifyOnPush";

const pj = require(`${appRoot.path}/package.json`);

const token = process.env.GITHUB_TOKEN;

export const configuration: Configuration = {
    name: pj.name,
    version: pj.version,
    teamIds: ["T1JVCMVH7"], // <-- run @atomist pwd in your slack team to obtain the team id
    commands: [
        HelloWorld,
        HelloChannel,
        HelloHttp,
        NewAutomation,
        () => updateCopyrightInOneRepository(),
        // Use a factory if you like...
        () => new ReviewCopyright(),
    ],
    events: [
        () => new CommentOnIssue(),
        () => new NotifyOnPush(),
    ],
    token,
    http: {
        enabled: true,
        auth: {
            basic: {
                enabled: false,
            },
            bearer: {
                enabled: false,
            },
        },
    },
};
