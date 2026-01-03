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
            // TODO arc/ellipsis
        }
    }

    return { segments, boundingBox: { minX, minY, maxX, maxY } };
}
