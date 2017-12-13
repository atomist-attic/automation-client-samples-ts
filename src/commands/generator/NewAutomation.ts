import { CommandHandler, MappedParameter } from "@atomist/automation-client/decorators";

import {
    HandleCommand, HandlerContext, HandlerResult, MappedParameters, Parameter, Secret,
    Secrets, success,
} from "@atomist/automation-client";
import { defaultRepoLoader } from "@atomist/automation-client/operations/common/defaultRepoLoader";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { RepoId, SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import { generate } from "@atomist/automation-client/operations/generate/generatorUtils";
import { GitHubProjectPersister } from "@atomist/automation-client/operations/generate/gitHubProjectPersister";
import { Project } from "@atomist/automation-client/project/Project";
import * as slack from "@atomist/slack-messages";

const seedOwner = "atomist";
const seedRepository = "automation-client-samples-ts";
const seedProjectName = "@atomist/automation-client-samples";

/**
 * Generator command to create a new node automation client repo
 */
@CommandHandler("Create a new automation repo", "new automation")
export class NewAutomation implements HandleCommand {

    @MappedParameter(MappedParameters.GitHubOwner)
    public owner: string;

    @Parameter({})
    public newRepository: string;

    @MappedParameter(MappedParameters.SlackTeam)
    public team: string;

    @Secret(Secrets.UserToken)
    private githubToken: string;

    public handle(context: HandlerContext, params: this): Promise<HandlerResult> {

        const seedRepoRef = new GitHubRepoRef(seedOwner, seedRepository);
        const newRepoRef = new GitHubRepoRef(params.owner, params.newRepository);

        const seedProject = defaultRepoLoader(context,  {token: params.githubToken })(seedRepoRef); // clone locally

        return generate(seedProject, // the starting Project
            context,
            {token: params.githubToken}, // GitHub credentials
            editProject(params), // function to change the Project
            GitHubProjectPersister, // create a repo, please
            newRepoRef) // new repository descriptor
            .then(newProject => context.messageClient.respond(
                "Great! Here is your new repository: " + slack.url(newRepoRef.url, params.newRepository)))
            .then(success);
    }

}

export function editProject(params: { team: string, owner: string, newRepository: string }):
(Project) => Promise<Project> {
    return (project: Project) =>
     editPackageJson(project, params)
        .then(editAtomistConfigTsToSetTeam(params))
         .then(alterReadme(params));
}

function editPackageJson(project: Project,
                         params: { team: string, owner: string, newRepository: string }): Promise<Project> {
    return project.findFile("package.json")
        .then(file => file.replaceAll(seedProjectName, params.newRepository))
        .then(file => file.replaceAll(seedRepository, params.newRepository))
        .then(file => file.replaceAll(seedOwner, params.owner))
        .then(() => project);
}

function editAtomistConfigTsToSetTeam(params: { team: string }): (p: Project) => Promise<Project> {
    return p =>
        p.findFile("src/atomist.config.ts")
        .then(file => file.replace(/teamIds:(.*),/m, `teamIds: ["${params.team}"]`))
            .then(() => p);
}

function alterReadme(params: { newRepository: string }): (p: Project) => Promise<Project> {
    return p =>
        p.findFile("README.md")
            .then(file => file.setContent(`# ${params.newRepository}

An Atomist [automation client](https://atomist.github.io/automation-client-ts/),
based on some [samples](https://github.com/atomist/automation-client-samples-ts).
`))
            .then(() => p);
}
