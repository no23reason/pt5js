import { Pt5CommandTypes, type Pt5File } from "../pt5/model.ts";
import type { Drawing, Segment } from "../drawing/model.ts";

const TAU = 2 * Math.PI;
const normalize = (a: number) => ((a % TAU) + TAU) % TAU;

/**
 * Returns true if the given angle lies on the arc swept from startAngle to endAngle.
 * counterClockwise=true means the arc goes in the direction of increasing angle (CCW in math space).
 */
function isAngleInArc(
    angle: number,
    startAngle: number,
    endAngle: number,
    counterClockwise: boolean,
): boolean {
    const s = normalize(startAngle);
    const e = normalize(endAngle);
    const a = normalize(angle);
    if (counterClockwise) {
        return s <= e ? a >= s && a <= e : a >= s || a <= e;
    } else {
        return s >= e ? a <= s && a >= e : a <= s || a >= e;
    }
}

function expandBBoxForArc(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterClockwise: boolean,
): [number, number, number, number] {
    for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
        if (isAngleInArc(angle, startAngle, endAngle, counterClockwise)) {
            minX = Math.min(minX, cx + radius * Math.cos(angle));
            minY = Math.min(minY, cy + radius * Math.sin(angle));
            maxX = Math.max(maxX, cx + radius * Math.cos(angle));
            maxY = Math.max(maxY, cy + radius * Math.sin(angle));
        }
    }
    return [minX, minY, maxX, maxY];
}

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
                    // in the PT5 they need to be subtracted as they appear with the opposite sign.
                    // See also the note next to handling this in the ncpToPt5 converter.
                    const centerX = currentX - i;
                    const centerY = currentY - j;

                    // Again, in contrast to normal G-code, the deltaX and deltaY come with the I and J
                    // effectively added so get rid of them.
                    const newX = currentX + deltaX - i;
                    const newY = currentY + deltaY - j;

                    const radius = Math.hypot(i, j);

                    const angleFromCenterToStart = Math.atan2(j, i) % TAU;
                    const angleFromCenterToEnd = Math.atan2(newY - centerY, newX - centerX) % TAU;

                    // For some reason this needs to be like this, not COUNTER_CLOCKWISE_CIRCLE.
                    // I have no idea why at the moment.
                    const counterClockwise = command.commandType === Pt5CommandTypes.CLOCKWISE_CIRCLE;

                    segments.push({
                        type: "arc",
                        x: centerX,
                        y: centerY,
                        radius,
                        startAngle: angleFromCenterToStart,
                        endAngle: angleFromCenterToEnd,
                        counterClockwise,
                    });

                    currentX = newX;
                    currentY = newY;
                    minX = Math.min(minX, newX);
                    minY = Math.min(minY, newY);
                    maxX = Math.max(maxX, newX);
                    maxY = Math.max(maxY, newY);

                    // Expand bounding box to include any cardinal extremes the arc sweeps through
                    [minX, minY, maxX, maxY] = expandBBoxForArc(
                        minX,
                        minY,
                        maxX,
                        maxY,
                        centerX,
                        centerY,
                        radius,
                        angleFromCenterToStart,
                        angleFromCenterToEnd,
                        counterClockwise,
                    );
                }
                break;
        }
    }

    return { segments, boundingBox: { minX, minY, maxX, maxY } };
}
