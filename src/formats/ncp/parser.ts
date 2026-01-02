import type { NcpCommand, NcpCommandType, NcpFile } from "./model.ts";

export function parseNcp(rawLines: string[]): NcpFile {
    const commands: NcpCommand[] = [];
    let currentCommandType: NcpCommandType | undefined = undefined;

    for (const rawLine of rawLines) {
        if (rawLine.startsWith("%")) {
            // for now, ignore the comments
            continue;
        }

        if (rawLine.startsWith("N")) {
            commands.push(...parseLine(rawLine, currentCommandType));
            // Only G commands can be ongoing (from the ones supported)
            currentCommandType = commands.findLast((command) =>
                command.commandType.startsWith("G"),
            )?.commandType;
        }
    }

    return { commands };
}

/**
 * Parse a single line of NCP.
 * One line can have multiple commands.
 * Also, some command types can span multiple lines so you don't have to repeat G01 over and over, for example:
 *
 * ```
 * N001 G01 X1 Y2
 * N002 G01 X2 Y3
 * ```
 *
 * is the same as:
 *
 * ```
 * N001 G01 X1 Y2
 * N002 X2 Y3
 * ```
 * @param rawLine the line to parse
 * @param currentCommandType the ongoing command type
 */
function* parseLine(rawLine: string, currentCommandType: NcpCommandType | undefined): Generator<NcpCommand> {
    const parts = rawLine.trimEnd().split(" ");
    let currentCommand: NcpCommand | undefined = undefined;

    if (parts[0].startsWith("N")) {
        // drop the line number for now
        parts.shift();
    }

    for (const part of parts) {
        if (part.startsWith("G") || part.startsWith("M")) {
            // new command, end the current one first
            if (currentCommand) {
                yield currentCommand;
            }
            currentCommandType = part as NcpCommandType; // TODO handle unknown commands
            currentCommand = {
                commandType: currentCommandType,
                args: {},
            };
        } else {
            // argument for an ongoing command, handle it
            if (!currentCommand) {
                if (!currentCommandType) {
                    throw new Error("No ongoing command yet there was an argument for it");
                }
                currentCommand = {
                    commandType: currentCommandType,
                    args: {},
                };
            }
            const argName = part[0];
            const argValue = part.slice(1);
            currentCommand.args[argName] = Number.parseFloat(argValue);
        }
    }

    if (currentCommand) {
        yield currentCommand;
    }
}
