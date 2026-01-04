import { type Pt5Command, type Pt5File, Pt5CommandTypes } from "./model.ts";

/**
 * Serialize the given argument.
 * If the value is zero, nothing needs to be emitted.
 * Any non-zero value must have a sign (even positive ones), except for the M91 pseudoargument.
 * @param name the name of the argument
 * @param value the value of the argument
 * @returns the serialized value
 */
function serializeArgument(name: string, value: number): string {
    // Handle the pseudo-argument of M91 explicitly
    if (name === "M") {
        return `M${value}`;
    }
    if (value === 0) {
        return "";
    }
    const sign = value > 0 ? "+" : "-";
    return `${name}${sign}${Math.abs(value)}`;
}

function serializeCommand(lineNumber: number, command: Pt5Command): string | undefined {
    const serializedArguments = Object.entries(command.args)
        .map(([argName, argValue]) => serializeArgument(argName, argValue))
        .filter(Boolean)
        .join(" ");

    return [`N${lineNumber}`, command.commandType, serializedArguments].filter(Boolean).join(" ");
}

export function* serializePt5(model: Pt5File): Generator<string> {
    let lineNumber = 1;
    let lastLine: string | undefined = undefined;

    // each file needs a preamble, this is empty for now, but the separator line needs to be there anyway
    yield "%";

    for (const command of model.commands) {
        switch (command.commandType) {
            case Pt5CommandTypes.MOVE:
            case Pt5CommandTypes.CLOCKWISE_CIRCLE:
            case Pt5CommandTypes.COUNTER_CLOCKWISE_CIRCLE:
                {
                    const serialized = serializeCommand(lineNumber, command);
                    if (serialized) {
                        if (lastLine) {
                            yield lastLine;
                        }
                        lastLine = serialized;
                        lineNumber++;
                    }
                }
                break;
            case Pt5CommandTypes.STOP:
            case Pt5CommandTypes.STOP_AND_REWIND:
            case Pt5CommandTypes.END:
                lastLine += ` ${command.commandType}`;
                break;
        }
    }
    if (lastLine) {
        yield lastLine;
    }
}
