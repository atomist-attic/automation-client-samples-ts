import {
    CommandHandler, failure,
    HandleCommand,
    HandlerContext,
    HandlerResult,
    MappedParameter,
    MappedParameters,
    Secret,
    Secrets, success,
} from "@atomist/automation-client";
import { GitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { editOne } from "@atomist/automation-client/operations/edit/editAll";
import { PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { Project } from "@atomist/automation-client/project/Project";

@CommandHandler("Add CONTRIBUTING.md in a single repository", "add CONTRIBUTING.md")
export class AddContributing implements HandleCommand {

    @MappedParameter(MappedParameters.GitHubOwner)
    public owner: string;

    @MappedParameter(MappedParameters.GitHubRepository)
    public repository: string;

    @Secret(Secrets.UserToken)
    public githubToken: string;

    public handle(context: HandlerContext): Promise<HandlerResult> {

        function editProject(p: Project) {
            return p.addFile("CONTRIBUTING.md", `Yes! Contributions are welcome`);
        }

        const pullRequest = new PullRequest("contributing", "Add CONTRIBUTING.md");

        const gitHubRepo = new GitHubRepoRef(this.owner, this.repository);

        return editOne(context,
            { token: this.githubToken }, // GitHub credentials
            editProject, // a function to change the project
            pullRequest, // how to save the edit
            gitHubRepo) // where to find the project
            .then(success, failure);
    }
}
