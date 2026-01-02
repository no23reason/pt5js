import { NcpCommandTypes, type NcpFile } from "../ncp/model.ts";
import { type Pt5Command, Pt5CommandTypes, type Pt5File } from "../pt5/model.ts";

function roundTo(num: number, numDecimals: number): number {
    return Math.round(num * Math.pow(10, numDecimals)) / Math.pow(10, numDecimals);
}

function safeAdd(a: number, b: number): number {
    return roundTo(a + b, 3);
}

function millimetersToMicrometers(a: number): number {
    return Math.round(a * 1000);
}

export function ncpToPt5(ncpFile: NcpFile): Pt5File {
    let isAbsolute = true;
    let lastX = 0;
    let lastY = 0;

    const commands: Pt5Command[] = [];

    for (const command of ncpFile.commands) {
        switch (command.commandType) {
            case NcpCommandTypes.MOVE:
                {
                    let newX: number;
                    let newY: number;
                    let deltaX: number;
                    let deltaY: number;
                    if (isAbsolute) {
                        newX = command.args["X"] ?? lastX;
                        newY = command.args["Y"] ?? lastY;

                        deltaX = safeAdd(newX, -lastX);
                        deltaY = safeAdd(newY, -lastY);
                    } else {
                        deltaX = command.args["X"] ?? 0;
                        deltaY = command.args["Y"] ?? 0;

                        newX = safeAdd(lastX, deltaX);
                        newY = safeAdd(lastY, deltaY);
                    }

                    const args: Record<string, number> = {};
                    if (deltaX) {
                        args["X"] = millimetersToMicrometers(deltaX);
                    }
                    if (deltaY) {
                        args["Y"] = millimetersToMicrometers(deltaY);
                    }

                    commands.push({
                        commandType: Pt5CommandTypes.MOVE,
                        args,
                    });

                    lastX = newX;
                    lastY = newY;
                }
                break;
            case NcpCommandTypes.CLOCKWISE_CIRCLE:
            case NcpCommandTypes.COUNTER_CLOCKWISE_CIRCLE:
                {
                    let newX: number;
                    let newY: number;
                    let deltaX: number;
                    let deltaY: number;
                    if (isAbsolute) {
                        newX = command.args["X"] ?? lastX;
                        newY = command.args["Y"] ?? lastY;

                        deltaX = safeAdd(newX, -lastX);
                        deltaY = safeAdd(newY, -lastY);
                    } else {
                        deltaX = command.args["X"] ?? 0;
                        deltaY = command.args["Y"] ?? 0;

                        newX = safeAdd(lastX, deltaX);
                        newY = safeAdd(lastY, deltaY);
                    }
                    const i = command.args["I"] ?? 0;
                    const j = command.args["J"] ?? 0;

                    const args: Record<string, number> = {};
                    if (deltaX) {
                        args["X"] = millimetersToMicrometers(deltaX);
                    }
                    if (deltaY) {
                        args["Y"] = millimetersToMicrometers(deltaY);
                    }
                    if (i) {
                        args["I"] = millimetersToMicrometers(i);
                    }
                    if (j) {
                        args["J"] = millimetersToMicrometers(j);
                    }

                    commands.push({
                        commandType:
                            command.commandType === NcpCommandTypes.CLOCKWISE_CIRCLE
                                ? Pt5CommandTypes.CLOCKWISE_CIRCLE
                                : Pt5CommandTypes.COUNTER_CLOCKWISE_CIRCLE,
                        args,
                    });

                    lastX = newX;
                    lastY = newY;
                }
                break;
            case NcpCommandTypes.END:
                commands.push({ commandType: Pt5CommandTypes.END, args: {} });
                break;
            case NcpCommandTypes.STOP:
                commands.push({ commandType: Pt5CommandTypes.STOP, args: {} });
                break;
            case NcpCommandTypes.STOP_AND_REWIND:
                commands.push({ commandType: Pt5CommandTypes.STOP_AND_REWIND, args: {} });
                break;
            case NcpCommandTypes.SET_ABSOLUTE_MODE:
                isAbsolute = true;
                break;
            case NcpCommandTypes.SET_INCREMENTAL_MODE:
                isAbsolute = false;
                break;
        }
    }

    return { commands };
}
