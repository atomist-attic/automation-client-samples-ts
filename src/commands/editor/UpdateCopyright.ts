import { HandleCommand, Parameter } from "@atomist/automation-client";
import { Parameters } from "@atomist/automation-client/decorators";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { MappedRepoParameters } from "@atomist/automation-client/operations/common/params/MappedRepoParameters";
import { PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { editorHandler } from "@atomist/automation-client/operations/edit/editorToCommand";
import { Project } from "@atomist/automation-client/project/Project";

// First define a function to change the project
export function updateCopyright(newYear: string) {
    return (p: Project): Promise<Project> => {
        return p.findFile("README.md")
            .then(file => file.replace(/(Copyright.*\s)[0-9]+(\s+Atomist)/, `$1${newYear}$2`))
            .then(() => p);
    };
}

@Parameters()
export class UpdateCopyrightInOneRepositoryParameters extends BaseEditorOrReviewerParameters {
    @Parameter({ pattern: /^.*$/ })
    public newYear: string;

    constructor() {
        super(new MappedRepoParameters());
    }
}

export function updateCopyrightInOneRepository(): HandleCommand {
    return editorHandler<UpdateCopyrightInOneRepositoryParameters>(
        params => updateCopyright(params.newYear),
        UpdateCopyrightInOneRepositoryParameters,
        "Update Copyright in one repository", {
            intent: "update copyright",
            editMode: new PullRequest("update-copyright-year", "Update the copyright"),
        });
}
