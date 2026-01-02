import { type Pt5Command, type Pt5File, Pt5CommandTypes } from "./model.ts";

/**
 * Serialize the given argument.
 * If the value is zero, nothing needs to be emitted.
 * Any non-zero value must have a sign (even positive ones).
 * @param name the name of the argument
 * @param micrometers the value of the argument
 * @returns the serialized value
 */
function serializeArgument(name: string, micrometers: number): string {
    if (micrometers === 0) {
        return "";
    }
    const sign = micrometers > 0 ? "+" : "-";
    return `${name}${sign}${Math.abs(micrometers)}`;
}

function serializeCommand(lineNumber: number, command: Pt5Command): string | undefined {
    const serializedArguments = Object.entries(command.args)
        .map(([argName, argValue]) => serializeArgument(argName, argValue))
        .filter(Boolean)
        .join(" ");

    // HACK skip commands without supported arguments
    // TODO this should be handled in the conversion
    if (!serializedArguments) {
        return;
    }

    // for some reason there needs to be "M91" appended to the very first movement
    // TODO: do this on the model level
    const firstMovementM91 = lineNumber == 1 ? "M91" : "";

    return [`N${lineNumber}`, command.commandType, serializedArguments, firstMovementM91]
        .filter(Boolean)
        .join(" ");
}

export function* serializePt5(model: Pt5File): Generator<string> {
    let lineNumber = 1;
    let lastLine: string | undefined = undefined;
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
