import { CommandHandler, MappedParameter } from "@atomist/automation-client/decorators";
import { UniversalSeed } from "@atomist/automation-client/operations/generate/UniversalSeed";
import { Microgrammar } from "@atomist/microgrammar/Microgrammar";

import { MappedParameters } from "@atomist/automation-client/Handlers";
import { Project } from "@atomist/automation-client/project/Project";
import { doWithAtMostOneMatch } from "@atomist/automation-client/project/util/parseUtils";

/**
 * Generator command to create a new node automation client repo
 */
@CommandHandler("Create a new automation repo", "new automation")
export class NewAutomation extends UniversalSeed {

    @MappedParameter(MappedParameters.SlackTeam)
    public team: string;

    constructor() {
        super();
        this.sourceOwner = "atomist";
        this.sourceRepo = "automation-client-samples-ts";
    }

    public manipulate(project: Project) {
        return this.editPackageJson(project)
            .then(editAtomistConfigTsToSetTeam(this.team));
    }

    protected editPackageJson(p: Project): Promise<Project> {
        return doWithAtMostOneMatch<{ name: string }, Project>(p, "package.json", packageJsonNameGrammar, m => {
            m.name = this.targetRepo;
        });
    }

}

function editAtomistConfigTsToSetTeam(team: string): (p: Project) => Promise<Project> {
    return p => doWithAtMostOneMatch<{ name: string }, Project>(p,
        "src/atomist.config.ts", atomistConfigTeamNameGrammar, m => {
            console.log(`Setting team to [${team}]`);
            m.name = team;
        });
}

// "name": "@atomist/automation-client-samples",
const packageJsonNameGrammar = Microgrammar.fromString<{ name: string }>(
    '"name": "${name}"', {
        name: /[^"]+/,
    });

// teamIds: "T1L0VDKJP",
export const atomistConfigTeamNameGrammar = Microgrammar.fromString<{ name: string }>(
    'teamIds: "${name}"',
    {
        name: /T[0-9A-Z]+/,
    },
);
