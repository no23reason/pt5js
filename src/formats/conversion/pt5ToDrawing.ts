import { Pt5CommandTypes, type Pt5File } from "../pt5/model.ts";
import type { Drawing, Segment } from "../drawing/model.ts";

export function pt5ToDrawing(pt5: Pt5File): Drawing {
    const segments: Segment[] = [];

    let currentX = 0;
    let currentY = 0;

    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    for (const command of pt5.commands) {
        switch (command.commandType) {
            case Pt5CommandTypes.MOVE:
                {
                    const newX = currentX + (command.args["X"] ?? 0);
                    const newY = currentY + (command.args["Y"] ?? 0);
                    segments.push({
                        type: "line",
                        x: newX,
                        y: newY,
                    });
                    currentX = newX;
                    currentY = newY;
                    minX = Math.min(minX, newX);
                    minY = Math.min(minY, newY);
                    maxX = Math.max(maxX, newX);
                    maxY = Math.max(maxY, newY);
                }
                break;
            case Pt5CommandTypes.CLOCKWISE_CIRCLE:
            case Pt5CommandTypes.COUNTER_CLOCKWISE_CIRCLE:
                {
                    const deltaX = command.args["X"] ?? 0;
                    const deltaY = command.args["Y"] ?? 0;

                    const i = command.args["I"] ?? 0;
                    const j = command.args["J"] ?? 0;

                    // Notice the minus, in normal G-code the I and J are added to X and Y respectively,
                    // in the PT5 they need to be subtracted as they appear wit the opposite sign.
                    // See also the note next to handling this in the ncpToPt5 converter.
                    const centerX = currentX - i;
                    const centerY = currentY - j;

                    const newX = currentX + deltaX;
                    const newY = currentY + deltaY;

                    const radius = Math.hypot(i, j);

                    const angleFromCenterToStart = Math.atan2(j, i) % (2 * Math.PI);
                    const angleFromCenterToEnd = Math.atan2(newY - centerY, newX - centerX) % (2 * Math.PI);

                    segments.push({
                        type: "arc",
                        x: centerX,
                        y: centerY,
                        radius,
                        startAngle: angleFromCenterToStart,
                        endAngle: angleFromCenterToEnd,
                        // For some reason this needs to be like this, not COUNTER_CLOCKWISE_CIRCLE.
                        // I have no idea why at the moment.
                        counterClockwise: command.commandType === Pt5CommandTypes.CLOCKWISE_CIRCLE,
                    });

                    currentX = newX;
                    currentY = newY;
                    minX = Math.min(minX, newX);
                    minY = Math.min(minY, newY);
                    maxX = Math.max(maxX, newX);
                    maxY = Math.max(maxY, newY);
                }
                break;
        }
    }

    return { segments, boundingBox: { minX, minY, maxX, maxY } };
}
