import {
    CommandHandler,
    HandleCommand,
    HandlerContext,
    HandlerResult,
    Secret,
    Secrets,
} from "@atomist/automation-client";
import { failure, Success } from "@atomist/automation-client/HandlerResult";
import { isGitHubRepoRef } from "@atomist/automation-client/operations/common/GitHubRepoRef";
import { RepoRef } from "@atomist/automation-client/operations/common/RepoId";
import { reviewAll } from "@atomist/automation-client/operations/review/reviewAll";
import {
    ProjectReview, ReviewComment,
    Severity,
} from "@atomist/automation-client/operations/review/ReviewResult";
import { Project } from "@atomist/automation-client/project/Project";
import * as slack from "@atomist/slack-messages";

const goodCopyright = /Copyright.*2017.*Atomist/m;
const otherCopyright = /Copyright.*Atomist/m;

// First define a function to scrutinize the project. Return a ProjectReview
export function reviewProject(p: Project, context: HandlerContext): Promise<ProjectReview> {
    return p.findFile("README.md")
        .then(file => file.getContent())
        .then( (readme: string): ReviewComment => {
            if (goodCopyright.exec(readme)) {
                return { severity: "info", detail: "up-to-date", category: "copyright"};
            } else if (otherCopyright.exec(readme)) {
                return { severity: "warn", detail: "copyright is out of date", category: "copyright"};
            } else {
                return {severity: "error", detail: "no copyright detected", category: "copyright"};
            }})
        .then((reviewComment: ReviewComment): ProjectReview =>
            ({repoId: p.id, comments: [reviewComment]}));
}

// This turns a ProjectReview[] into a Slack message for display.
function report(reviews: ProjectReview[]): slack.SlackMessage {
    function reportOne(review: ProjectReview): slack.Attachment {
        return {
            title: linkToRepo(review.repoId),
            fallback: "",
            text: review.comments.map(c => toEmoji(c.severity) + " " + c.detail).join("\n"),
        };
    }
    const message: slack.SlackMessage = {
        attachments: reviews.map(reportOne),
    };
    return message;
}

@CommandHandler("Review the README copyright in all repositories", "review copyright")
export class ReviewCopyright implements HandleCommand {

    @Secret(Secrets.UserToken)
    public githubToken: string;

    public handle(context: HandlerContext): Promise<HandlerResult> {

        return reviewAll(context,
            { token: this.githubToken }, // GitHub credentials
            reviewProject)
            .then(report)
            .then(message => context.messageClient.respond(message))
            .then(() => Success, failure);
    }
}

function linkToRepo(repoRef: RepoRef): string {
    const description = `${repoRef}/${repoRef}`;
    return isGitHubRepoRef(repoRef) ?
        slack.url(repoRef.url, description) : description;
}

function toEmoji(s: Severity): string {
    switch (s) {
        case "info":
            return ":green_heart:";
        case "warn":
            return ":large_orange_diamond:";
        case "error":
            return ":red_circle:";
    }
}
