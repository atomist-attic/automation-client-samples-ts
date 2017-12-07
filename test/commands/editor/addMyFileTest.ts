import "mocha";

import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";
import * as assert from "power-assert";
import { addMyFile } from "../../../src/commands/editor/addMyFile";

describe("addMyFile editor", () => {
    it("adds the file", done => {
        const p = InMemoryProject.of({ path: "existingFile.txt", content: "Hi\n" });
        addMyFile(p).then(r => {
            assert(p.findFileSync("myFile.txt").getContentSync().includes("I was here"));
        }).then(() => done(), done);
    });
});
