import * as assert from "power-assert";

import * as appRoot from "app-root-path";

import { NodeFsLocalProject } from "@atomist/automation-client/project/local/NodeFsLocalProject";
import { InMemoryFile } from "@atomist/automation-client/project/mem/InMemoryFile";
import { InMemoryProject } from "@atomist/automation-client/project/mem/InMemoryProject";

import {
    editProject,
    NewAutomation,
} from "../../../src/commands/generator/NewAutomation";

describe("NewAutomation", () => {

    it("fails on the wrong seed", done => {
        const files = [
            new InMemoryFile("a", "a"),
            new InMemoryFile("b", "a"),
            new InMemoryFile("c/d/e.txt", "a"),
        ];
        const project = InMemoryProject.of(...files);
        editProject({team: "", owner: "", newRepository: ""})(project)
            .then(() => done(new Error("This should have failed")))
                .catch(err => done());
    });

    function thisProject(configContent: string = null) {
        const praw = new NodeFsLocalProject("test", appRoot.path);
        return InMemoryProject.of(
            { path: "package.json", content: praw.findFileSync("package.json").getContentSync() },
            { path: "src/atomist.config.ts",
                content: configContent || praw.findFileSync("src/atomist.config.ts").getContentSync() },
            { path: "README.md", content: praw.findFileSync("README.md").getContentSync() },
        );
    }

    it("edits this project", done => {
        editProject({ team: "T1000", newRepository: "theTargetRepo", owner: "me" })(thisProject())
            .then(pr => {
                const newPackageJson = JSON.parse(pr.findFileSync("package.json").getContentSync());
                assert(newPackageJson.name === "theTargetRepo",
                    `Was [${newPackageJson.name}] expected ["theTargetRepo"]`);

                const newAtomistConfig = pr.findFileSync("src/atomist.config.ts").getContentSync();
                assert(newAtomistConfig.includes("T1000"), "Actual content was\n" + newAtomistConfig);
                assert(pr.findFileSync("README.md").getContentSync().indexOf("theTargetRepo") > 0);
                done();
            }).catch(done);
    });

    it("edits a config with an teamIds string", done => {
        const config = `export const configuration: Configuration = {
    name: pj.name,
    version: pj.version,
    teamIds: "T1L0VDKJP",
    commands: [
        () => new HelloWorld(),
    ],
}`;
        editProject({ team: "T1000", newRepository: "theTargetRepo", owner: "me" })(thisProject(config))
            .then(pr => {
                const newPackageJson = JSON.parse(pr.findFileSync("package.json").getContentSync());
                assert(newPackageJson.name === "theTargetRepo",
                    `Was [${newPackageJson.name}] expected ["theTargetRepo"]`);

                const newAtomistConfig = pr.findFileSync("src/atomist.config.ts").getContentSync();
                assert(newAtomistConfig.includes("T1000"), "Actual content was\n" + newAtomistConfig);
                done();
            }).catch(done);
    });

    it("edits a config with teamIds array", done => {
        const config = `export const configuration: Configuration = {
    name: pj.name,
    version: pj.version,
    teamIds: ["T1L0VDKJP", "TK421", "T100"],
    commands: [
        () => new HelloWorld(),
    ],
};`;
        editProject({ team: "T1000", newRepository: "theTargetRepo", owner: "me" })(thisProject(config))
            .then(pr => {
                const newPackageJson = JSON.parse(pr.findFileSync("package.json").getContentSync());
                assert(newPackageJson.name === "theTargetRepo",
                    `Was [${newPackageJson.name}] expected ["theTargetRepo"]`);

                const newAtomistConfig = pr.findFileSync("src/atomist.config.ts").getContentSync();
                assert(newAtomistConfig.includes("T1000"), "Actual content was\n" + newAtomistConfig);
                done();
            }).catch(done);
    });

    it("edits a config with null teamIds", done => {
        const config = `export const configuration: Configuration = {
    name: pj.name,
    version: pj.version,
    teamIds: null,
    commands: [
        () => new HelloWorld(),
    ],
}`;
        editProject({ team: "T1000", newRepository: "theTargetRepo", owner: "me" })(thisProject(config))
            .then(pr => {
                const newPackageJson = JSON.parse(pr.findFileSync("package.json").getContentSync());
                assert(newPackageJson.name === "theTargetRepo",
                    `Was [${newPackageJson.name}] expected [${"theTargetRepo"}]`);

                const newAtomistConfig = pr.findFileSync("src/atomist.config.ts").getContentSync();
                assert(newAtomistConfig.includes("T1000"), "Actual content was\n" + newAtomistConfig);
                done();
            }).catch(done);
    });

    it("edits a config with undefined teamIds", done => {
        const config = `export const configuration: Configuration = {
    name: pj.name,
    version: pj.version,
    teamIds: undefined,
    commands: [
        () => new HelloWorld(),
    ],
}`;
        editProject({ team: "T1000", newRepository: "theTargetRepo", owner: "me" })(thisProject(config))
            .then(pr => {
                const newPackageJson = JSON.parse(pr.findFileSync("package.json").getContentSync());
                assert(newPackageJson.name === "theTargetRepo",
                    `Was [${newPackageJson.name}] expected [${"theTargetRepo"}]`);

                const newAtomistConfig = pr.findFileSync("src/atomist.config.ts").getContentSync();
                assert(newAtomistConfig.includes("T1000"), "Actual content was\n" + newAtomistConfig);
                done();
            }).catch(done);
    });

    it("edits a config with no teamIds");

});
