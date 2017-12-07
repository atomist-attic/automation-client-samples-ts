import "mocha";

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";

import { updateCopyright } from "../../../src/commands/editor/UpdateCopyright";
const SampleReadme = `
# I am a project

with some stuff

---------
Copyright © 2016  Atomist
`;

describe("UpdateCopyrightEditor", () => {

    it("no comments for no matching artifact", done => {
        const project = InMemoryProject.of({ path: "README.md", content: SampleReadme });

        const result = updateCopyright("2222")(project);

        result.then(p => {
            return p.findFile("README.md").then(f =>
                f.getContent().then(content => {
                    assert(content.indexOf("Copyright © 2222  Atomist") > 0, content);
                }));
        }).then(done, done);
    });

});
