import { CommandHandler, Tags } from "@atomist/automation-client/decorators";
import { hasFile } from "@atomist/automation-client/internal/util/gitHub";
import { setSpringBootVersionEditor } from "./setSpringBootVersionEditor";
import { findMatches, Match } from "@atomist/automation-client/project/util/parseUtils";
import { ArtifactContainer, parentStanzaOfGrammar } from "../../../grammars/mavenGrammars";
import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { SpringBootStarter } from "./springConstants";
import { LocalOrRemoteRepoOperation } from "@atomist/automation-client/operations/common/LocalOrRemoteRepoOperation";
import { HandleCommand } from "@atomist/automation-client/HandleCommand";
import { HandlerResult } from "@atomist/automation-client/HandlerResult";
import { logger } from "@atomist/automation-client/internal/util/logger";
import {
    editProjectUsingPullRequest,
    PullRequestEdit
} from "@atomist/automation-client/operations/support/editorUtils";
import { GitProject } from "@atomist/automation-client/project/git/GitProject";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import { ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";

/**
 * Upgrade the version of Spring Boot projects to the latest version
 * found in the org
 */
@CommandHandler("Harmonize versions of Spring Boot across an org to the latest version",
    "modernize spring boot version")
@Tags("atomist", "spring")
export class SpringBootModernizer extends LocalOrRemoteRepoOperation implements HandleCommand {

    constructor() {
        // Check with an API call if the repo has a POM,
        // to save unnecessary cloning
        super(r => this.local ? Promise.resolve(true) : hasFile(this.githubToken, r.owner, r.repo, "pom.xml"));
    }

    public handle(context: HandlerContext): Promise<HandlerResult> {
        // First, look for projects and work out version spread
        const versions: string[] = [];
        return this.repoFinder()(context)
            .then(repoIds => {
                const reposToEdit = repoIds.filter(this.repoFilter);
                logger.info("Repos to edit are " + reposToEdit.map(r => r.repo).join(","));
                const projectPromises =
                    reposToEdit.map(id =>
                        this.repoLoader()(id)
                            .then(project => {
                                return findMatches<ArtifactContainer>(project, "pom.xml", parentStanzaOfGrammar(SpringBootStarter))
                                    .then(matches => {
                                        if (matches.length === 1) {
                                            versions.push(matches[0].version);
                                            console.log("Found version [%s]", matches[0].gav.version)
                                            return {id, project, match: matches[0]};
                                        } else {
                                            return undefined;
                                        }
                                    });
                            })
                    );
                return Promise.all(projectPromises).then(ts => ts.filter(t => !!t));
            })
            .then(springBootProjects => {
                if (springBootProjects.length > 0) {
                    // TODO this is wrong
                    const uniqueVersions = _.uniq(versions).sort();
                    const desiredVersion = _.last(uniqueVersions);
                    return context.messageClient.respond(
                        `Spring Boot versions found in org: [${uniqueVersions.join(",")}]\n` +
                        `Attempting to migrate all projects to ${desiredVersion}`)
                        .then(_ => {
                            const editor = setSpringBootVersionEditor(desiredVersion);
                            const edits = springBootProjects
                                .filter(p => p.match.version !== desiredVersion)
                                .map(p => {
                                        return context.messageClient.respond(
                                            `Migrating ${p.id.repo} to Spring Boot ${desiredVersion} from ${p.match.version}`)
                                            .then(_ => this.doEdit(context, p, editor));
                                    }
                                );
                            return Promise.all(edits)
                                .then(x => {
                                    return {
                                        code: 0,
                                    };
                                });
                        });
                } else {
                    return context.messageClient
                        .respond("Nothing to do: No Spring Boot projects found in organization")
                        .then(_ => {
                            return {code: 0}
                        });
                }
            });
    }

    /**
     * Perform the actual edit. Broken out so that we can test easily.
     * @param {HandlerContext} context
     * @param {ProjectMatch} p
     * @param {ProjectEditor<any>} editor
     * @return {Promise<any>}
     */
    protected doEdit(context: HandlerContext, p: ProjectMatch, editor: ProjectEditor<any>) {
        // TODO should be a branch
        return editProjectUsingPullRequest(context, p.id, p.project, editor,
            new PullRequestEdit("branch", "title"));
    }

}

export interface ProjectMatch {
    id: RepoId;
    project: GitProject;
    match: Match<ArtifactContainer>;
}