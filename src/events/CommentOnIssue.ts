import {
    EventFired,
    EventHandler,
    HandleEvent,
    HandlerContext,
    HandlerResult,
    Secret,
    Secrets,
    Success,
    Tags,
} from "@atomist/automation-client/Handlers";
import axios from "axios";

@EventHandler("Notify channel on new issue and add comment to issue", `subscription CommentOnIssue
{
  Issue {
    number
    title
    openedBy {
        login
    }
    repo {
      owner
      name
      channels {
        name
      }
    }
  }
}`)
@Tags("issue", "comment")
export class CommentOnIssue implements HandleEvent<any> {

    @Secret(Secrets.OrgToken)
    public githubToken: string;

    public handle(e: EventFired<any>, ctx: HandlerContext): Promise<HandlerResult> {
        const issue = e.data.Issue[0];
        const authorizingGithubUser = whoami(this.githubToken);

        // To see these messages, configure Atomist in any slack channel: `@atomist-bot repo <repository-name>`
        // Then create an issue in <repository-name> to see this notification in that channel!
        const postInLinkedChannels =
            ctx.messageClient.addressChannels(`Got a new issue \`${issue.number}# ${issue.title}\``,
                issue.repo.channels.map(c => c.name));

        const commentOnIssue = postInLinkedChannels
            .then(() =>
                authorizingGithubUser.then(me => {
                    // Only comment on issues that I created. Take out this condition to comment on all issues!
                    if (issue.openedBy.login === me) {
                        // tslint:disable-next-line:max-line-length
                        return axios.post(`https://api.github.com/repos/${issue.repo.owner}/${issue.repo.name}/issues/${issue.number}/comments`,
                            { body: "Hey, I saw your issue!" },
                            { headers: { Authorization: `token ${this.githubToken}` } });
                    } else {
                        // tslint:disable-next-line:max-line-length
                        console.log(`This issue was created by ${issue.openedBy.login} and I am ${me} so I will not comment on it.`);
                        return;
                    }
                }));
        return commentOnIssue.then(() => {
            return Success;
        });
    }
}

function whoami(githubToken: string): Promise<string> {
    const githubUser = axios.get(
        `https://api.github.com/user`,
        { headers: { Authorization: `token ${githubToken}` } })
        .then(response => response.data.login);
    return githubUser;
}
