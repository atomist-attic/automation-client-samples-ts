import { Configuration } from "@atomist/automation-client/configuration";
import * as appRoot from "app-root-path";
import { SpringBootModernizer } from "./commands/editor/spring/SpringBootModernizer";
import { SpringBootVersionUpgrade } from "./commands/editor/spring/SpringBootVersionUpgrade";
import { UpdateCopyright } from "./commands/editor/UpdateCopyright";
import { NewAutomation } from "./commands/generator/NewAutomation";
import { VersionMapper } from "./commands/reviewer/maven/VersionMapper";
import { VersionSpreadReviewer } from "./commands/reviewer/maven/VersionSpreadReviewer";
import { ReviewCopyright } from "./commands/reviewer/ReviewCopyright";
import { SpringBootVersionReviewer } from "./commands/reviewer/spring/SpringBootVersionReviewer";
import { HelloWorld } from "./commands/simple/HelloWorld";
import { CommentOnIssue } from "./events/CommentOnIssue";
import { NotifyOnPush } from "./events/NotifyOnPush";

const pj = require(`${appRoot.path}/package.json`);

const token = process.env.GITHUB_TOKEN;

export const configuration: Configuration = {
    name: pj.name,
    version: pj.version,
    teamIds: ["T095SFFBK"], // <-- run @atomist pwd in your slack team to obtain the team id
    commands: [
        HelloWorld,
        SpringBootVersionReviewer,
        VersionSpreadReviewer,
        VersionMapper,
        NewAutomation,
        SpringBootModernizer,
        UpdateCopyright,
        ReviewCopyright,
        // Use a factory if you like...
        () => new SpringBootVersionUpgrade(),
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
