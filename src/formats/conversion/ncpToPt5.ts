import { type NcpFile } from "../ncp/model.ts";
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

class NcpToPt5Conversion {
    private i: number = 0;
    private j: number = 0;
    private x: number | undefined = undefined;
    private y: number | undefined = undefined;

    private motion: number = -1; // 0 is a valid motion but it is not supported by PT5
    private positioning: number = 90;
    private lastEnd: number = 0;

    private ncpFile: NcpFile;

    constructor(ncpFile: NcpFile) {
        this.ncpFile = ncpFile;
    }

    run = (): Pt5File => {
        let currentX = 0;
        let currentY = 0;

        const commands: Pt5Command[] = [];

        for (const line of this.ncpFile.lines) {
            this.clearCoords();

            for (const [type, value] of line.words) {
                switch (type) {
                    case "G":
                        if (value >= 0 && value <= 3) {
                            this.motion = value;
                        } else if (value === 90 || value === 91) {
                            this.positioning = value;
                        }
                        break;
                    case "M":
                        if (value === 2 || value === 30) {
                            this.lastEnd = value;
                        }
                        break;
                    case "I":
                        this.i = value;
                        break;
                    case "J":
                        this.j = value;
                        break;
                    case "X":
                        this.x = this.isAbsolutePositioning() ? value : currentX + value;
                        break;
                    case "Y":
                        this.y = this.isAbsolutePositioning() ? value : currentY + value;
                        break;
                }
            }

            // now that we have the values, see if some output needs to happen
            // pt5 only supports moves and ends: end is handled separately so only check for movement
            if (this.hasMotionSelected() && (this.x != undefined || this.y != undefined)) {
                const deltaX = this.x != undefined ? safeAdd(this.x, -currentX) : undefined;
                const deltaY = this.y != undefined ? safeAdd(this.y, -currentY) : undefined;

                currentX = this.x ?? currentX;
                currentY = this.y ?? currentY;

                const args: Pt5Command["args"] = {};
                if (deltaX != undefined) {
                    args["X"] = millimetersToMicrometers(deltaX);
                }
                if (deltaY != undefined) {
                    args["Y"] = millimetersToMicrometers(deltaY);
                }

                if (this.motion === 1) {
                    commands.push({
                        commandType: Pt5CommandTypes.MOVE,
                        args,
                    });
                } else if (this.motion === 2 || this.motion === 3) {
                    if (this.i !== 0) {
                        args["I"] = millimetersToMicrometers(this.i);
                    }
                    if (this.j !== 0) {
                        args["J"] = millimetersToMicrometers(this.j);
                    }
                    commands.push({
                        commandType:
                            this.motion === 2
                                ? Pt5CommandTypes.CLOCKWISE_CIRCLE
                                : Pt5CommandTypes.COUNTER_CLOCKWISE_CIRCLE,
                        args,
                    });
                }

                if (commands.length === 1) {
                    // For some reason, there needs to be a M91 argument appended to the very first motion
                    commands[0].args["M"] = 91;
                }
            }
        }

        commands.push({
            commandType: this.lastEnd === 30 ? Pt5CommandTypes.STOP_AND_REWIND : Pt5CommandTypes.END,
            args: {},
        });

        return { commands };
    };

    private clearCoords = () => {
        this.x = undefined;
        this.y = undefined;
        this.i = 0;
        this.j = 0;
    };
    private isAbsolutePositioning = (): boolean => this.positioning === 90;
    private hasMotionSelected = (): boolean => this.motion >= 0 && this.motion <= 3;
}

export function ncpToPt5(ncpFile: NcpFile): Pt5File {
    return new NcpToPt5Conversion(ncpFile).run();
}
