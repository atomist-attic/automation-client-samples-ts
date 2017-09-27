import "mocha";

import * as assert from "power-assert";
import { RepoFinder } from "@atomist/automation-client/operations/common/RepoFinder";
import { VersionSpreadReviewer } from "../../../../src/commands/reviewer/VersionSpreadReviewer";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { RepoId } from "@atomist/automation-client/operations/common/RepoId";
import { Project } from "@atomist/automation-client/project/Project";
import { SpringBootModernizer } from "../../../../src/commands/editor/spring/SpringBootModernizer";


class TestModernizer extends SpringBootModernizer {

    private readonly rf: RepoFinder;
    private readonly rl: RepoLoader;

    // TODO could share this logic with version updater test
    constructor(private repos: Array<{ repoId: RepoId, project: Project }>) {
        super();
        // Prevent querying of github
        this.local = true;
        this.rf = ctx => Promise.resolve(repos.map(r => r.repoId));
        this.rl = id => {
            const found = repos.find(repo => repo.repoId === id);
            if (!found) {
                throw new Error(`Cannot find repo`);
            }
            return Promise.resolve(found.project);
        };
    }

    protected repoFinder() {
        return this.rf;
    }

    protected repoLoader(): RepoLoader {
        return this.rl;
    }
}

describe("SpringBootModernizer", () => {

    // it("no comments for no matching artifact", done => {
    //     const project = InMemoryProject.of({path: "pom.xml", content: NonSpringPom});
    //     const repoId: RepoId = new SimpleRepoId("a", "b");
    //
    //     const vs = new TestVersionSpreadReviewer([{repoId, project}]);
    //     vs.groupId = "none";
    //     vs.artifactId = "nonsense";
    //
    //     vs.handle(null).then(hr => {
    //         assert(hr.projectsReviewed === 1);
    //         assert(hr.projectReviews.length === 1);
    //         done();
    //     }).catch(done);
    // });
    //
    // it("finds version of matching artifact in single project", done => {
    //     const project = InMemoryProject.of({path: "pom.xml", content: springBootPom("1.3.0")});
    //     const repoId: RepoId = new SimpleRepoId("a", "b");
    //
    //     const vs = new TestVersionSpreadReviewer([{repoId, project}]);
    //     vs.groupId = "commons-io";
    //     vs.artifactId = "commons-io";
    //
    //     vs.handle(null).then(hr => {
    //         assert(hr.projectsReviewed === 1);
    //         assert(hr.projectReviews.length === 1);
    //         assert(hr.projectReviews[0].artifact === vs.artifactId);
    //         assert(hr.projectReviews[0].group === vs.groupId);
    //         assert(hr.projectReviews[0].version === "2.5");
    //         done();
    //     }).catch(done);
    // });
    //
    // it("aggregates single version in single project", done => {
    //     const project = InMemoryProject.of({path: "pom.xml", content: springBootPom("1.3.0")});
    //     const repoId: RepoId = new SimpleRepoId("a", "b");
    //
    //     const vs = new TestVersionSpreadReviewer([{repoId, project}]);
    //     vs.groupId = "commons-io";
    //     vs.artifactId = "commons-io";
    //
    //     vs.handle(null).then(hr => {
    //         assert(hr.projectsReviewed === 1);
    //         assert(hr.projectReviews.length === 1);
    //         assert.deepEqual(hr.versions, ["2.5"]);
    //         done();
    //     }).catch(done);
    // });

});
