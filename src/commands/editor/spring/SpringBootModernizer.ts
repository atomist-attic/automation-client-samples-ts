import { CommandHandler, Parameter, Tags } from "@atomist/automation-client/decorators";
import { hasFile } from "@atomist/automation-client/internal/util/gitHub";
import { EditorCommandSupport } from "@atomist/automation-client/operations/edit/EditorCommandSupport";
import { EditResult, ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { setSpringBootVersionEditor } from "./setSpringBootVersionEditor";
import { findMatches } from "@atomist/automation-client/project/util/parseUtils";
import { parentStanzaOfGrammar } from "../../../grammars/mavenGrammars";

/**
 * Upgrade the version of Spring Boot projects to a desired version
 */
@CommandHandler("Harmonize versions of Spring Boot across an org to the latest version",
    "modernize spring boot version")
@Tags("atomist", "spring")
export class SpringBootModernizer extends EditorCommandSupport {

    constructor() {
        // Check with an API call if the repo has a POM,
        // to save unnecessary cloning
        super(r => this.local ? Promise.resolve(true) : hasFile(this.githubToken, r.owner, r.repo, "pom.xml"));
    }

    public projectEditor(): ProjectEditor<EditResult> {
        // return (id, p, context) => {
        //     return findMatches(p, "pom.xml",
        //         parentStanzaOfGrammar("spring-boot-starter")
        //         .then(matches => {
        //             console.log("%d  matches looking for %s:%s", matches.length, this.groupId, this.artifactId);
        //             if (matches.length > 0) {
        //                 const version = matches[0].gav.version;
        //                 return Promise.resolve({
        //                     repoId: id,
        //                     comments: [],
        //                     group: this.groupId,
        //                     artifact: this.artifactId,
        //                     version,
        //                 });
        //             }
        //             return Promise.resolve(clean(id) as VersionReportReview);
        //             const desiredBootVersion = "1.5.2";
        //             return setSpringBootVersionEditor(desiredBootVersion);
        //         });
        //};
        return null;
    }

}
