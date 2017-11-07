import { failure, Success } from "@atomist/automation-client/HandlerResult";
import {
    CommandHandler,
    HandleCommand,
    HandlerContext,
    HandlerResult,
    Parameter,
    Secret,
    Secrets,
} from "@atomist/automation-client/Handlers";
import { editAll } from "@atomist/automation-client/operations/edit/editAll";
import { PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { EditResult, ProjectEditor, successfulEdit } from "@atomist/automation-client/operations/edit/projectEditor";
import { File } from "@atomist/automation-client/project/File";
import { Project } from "@atomist/automation-client/project/Project";

// First define a function to change the project
export function editProject(p: Project, context: HandlerContext, params: { newYear: string }): Promise<EditResult> {
    return p.findFile("README.md")
        .then(file => file.replace(/(Copyright.*\s)[0-9]+(\s+Atomist)/, `$1${params.newYear}$2`))
        .then(() => successfulEdit(p)); // TODO: include failedEdit once that's merged and released, PR74 on client
}

@CommandHandler("Update the README copyright in all repositories", "update README copyright year")
export class UpdateCopyright implements HandleCommand {

    @Parameter({ pattern: /^.*$/ })
    public newYear: string;

    @Secret(Secrets.UserToken)
    public githubToken: string;

    public handle(context: HandlerContext): Promise<HandlerResult> {

        const pullRequest = new PullRequest("update-copyright-year", "Update the copyright to " + this.newYear);

        return editAll(context,
            { token: this.githubToken }, // GitHub credentials
            editProject, // how to change the project
            pullRequest, // how to save the edit
            { newYear: this.newYear }) // parameters to pass on to the edit function
            .then(() => Success, failure);
    }
}
