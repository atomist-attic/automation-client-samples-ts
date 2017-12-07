
import { HandleCommand, HandlerContext } from "@atomist/automation-client";
import { BaseEditorOrReviewerParameters } from "@atomist/automation-client/operations/common/params/BaseEditorOrReviewerParameters";
import { PullRequest } from "@atomist/automation-client/operations/edit/editModes";
import { editorHandler } from "@atomist/automation-client/operations/edit/editorToCommand";
import { SimpleProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { Project } from "@atomist/automation-client/project/Project";

export const addMyFile: SimpleProjectEditor = (project: Project, ctx: HandlerContext) => {
    return project.addFile("myFile.txt", "I was here");
};

export function addFileCommand(): HandleCommand {
    return editorHandler(
        params => addMyFile,
        BaseEditorOrReviewerParameters,
        "AddMyFile", {
            description: "adds a tiny file",
            intent: "add my file",
            editMode: new PullRequest("one-tiny-file", "Add a small file"),
        });
}
