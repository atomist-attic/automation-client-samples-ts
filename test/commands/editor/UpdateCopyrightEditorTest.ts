import * as _ from "lodash";
import "mocha";

import { HandlerContext } from "@atomist/automation-client/HandlerContext";
import { ConsoleMessageClient } from "@atomist/automation-client/internal/message/ConsoleMessageClient";
import { RepoFinder } from "@atomist/automation-client/operations/common/repoFinder";
import { RepoId, SimpleRepoId } from "@atomist/automation-client/operations/common/RepoId";
import { RepoLoader } from "@atomist/automation-client/operations/common/repoLoader";
import { ProjectEditor } from "@atomist/automation-client/operations/edit/projectEditor";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import { Project } from "@atomist/automation-client/project/Project";
import * as assert from "power-assert";

import { editProject } from "../../../src/commands/editor/UpdateCopyright";
const SampleReadme = `
# I am a project

with some stuff

---------
Copyright © 2016  Atomist
`;

describe("UpdateCopyrightEditor", () => {

    it("no comments for no matching artifact", done => {
        const project = InMemoryProject.of({ path: "README.md", content: SampleReadme });

        const result = editProject(project, null, { newYear: "2222" });

        result.then(er => {
            assert(er.success);
            return project.findFile("README.md").then(f =>
                f.getContent().then(content => {
                    assert(content.indexOf("Copyright © 2222  Atomist") > 0, content);
                }));
        }).then(done, done);
    });

});
