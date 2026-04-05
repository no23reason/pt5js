import { type Pt5Command, type Pt5CommandType, Pt5CommandTypes, type Pt5File } from "./model.ts";

const MOTION_COMMAND_TYPES = new Set<string>([
    Pt5CommandTypes.MOVE,
    Pt5CommandTypes.CLOCKWISE_CIRCLE,
    Pt5CommandTypes.COUNTER_CLOCKWISE_CIRCLE,
]);

const STOP_COMMAND_TYPES = new Set<string>([
    Pt5CommandTypes.STOP,
    Pt5CommandTypes.END,
    Pt5CommandTypes.STOP_AND_REWIND,
]);

export function parsePt5(lines: string[]): Pt5File {
    const commands: Pt5Command[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "%") continue;

        // Strip line number prefix: N{digits}
        const withoutLineNum = trimmed.replace(/^N\d+\s*/, "");
        const tokens = withoutLineNum.split(/\s+/);
        if (tokens.length === 0) continue;

        let commandTypeStr = tokens[0];

        // for some reason some files in the wild have G92 in place of G02: sanitize it
        if (commandTypeStr === "G92") {
            commandTypeStr = "G02";
        }

        if (!MOTION_COMMAND_TYPES.has(commandTypeStr)) continue;

        const args: Pt5Command["args"] = {};
        let stopCommandType: string | null = null;

        for (let i = 1; i < tokens.length; i++) {
            const token = tokens[i];

            if (STOP_COMMAND_TYPES.has(token)) {
                stopCommandType = token;
                break;
            }

            // M91 style: letter M followed by digits without a sign
            const mMatch = token.match(/^M(\d+)$/);
            if (mMatch) {
                args["M"] = parseInt(mMatch[1], 10);
                continue;
            }

            // Regular args: letter, sign, number (e.g. X+100, Y-50)
            const argMatch = token.match(/^([A-Z])([+-])(\d+(?:\.\d+)?)$/);
            if (argMatch) {
                const name = argMatch[1];
                const sign = argMatch[2] === "-" ? -1 : 1;
                const value = parseFloat(argMatch[3]);
                args[name] = sign * value;
            }
        }

        commands.push({ commandType: commandTypeStr as Pt5CommandType, args });

        if (stopCommandType) {
            commands.push({ commandType: stopCommandType as Pt5CommandType, args: {} });
        }
    }

    // Ensure there is a terminal command if any motion commands were parsed
    if (commands.length > 0 && !STOP_COMMAND_TYPES.has(commands[commands.length - 1].commandType)) {
        commands.push({ commandType: Pt5CommandTypes.END, args: {} });
    }

    return { commands };
}
