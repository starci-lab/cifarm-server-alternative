import { Inject, Injectable, Logger } from "@nestjs/common"
import { execa } from "execa"
import { MODULE_OPTIONS_TOKEN } from "./exec.module-definition"
import { ExecOptions } from "./exec.types"

@Injectable()
export class ExecService {
    private readonly logger = new Logger(ExecService.name)
    private readonly shell: "powershell.exe" | "/bin/bash"

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: ExecOptions
    ) {
        const platform = process.platform
        this.shell = platform === "win32" ? "powershell.exe" : "/bin/bash"
    }
    public async exec(command: string, args: Array<string> = []): Promise<string> {
        // Log the command if debug is enabled
        this.logger.debug(`Executing command: ${command} ${args.join(" ")}`)

        // Execute the command
        const { stdout, stderr } = await execa(command, args, {
            shell: this.shell
        })

        // Log the error (if any)
        if (stderr) {
            this.logger.error(`Command error: ${stderr}`)
            throw new Error(stderr)
        }

        return stdout
    }
}
