import { describe, expect, it } from "vitest";
import { serializePt5 } from "../serializer.ts";
import { Pt5CommandTypes, type Pt5File } from "../model.ts";

describe("serializePt5", () => {
    it("should serialize a simple model", () => {
        const model: Pt5File = {
            commands: [
                {
                    commandType: Pt5CommandTypes.MOVE,
                    args: { X: 100, Y: -100 },
                },
                {
                    commandType: Pt5CommandTypes.CLOCKWISE_CIRCLE,
                    args: { X: 200, Y: -200, J: 50 },
                },
                {
                    commandType: Pt5CommandTypes.COUNTER_CLOCKWISE_CIRCLE,
                    args: { X: 300, Y: -300, I: -50 },
                },
                {
                    commandType: Pt5CommandTypes.END,
                    args: {},
                },
            ],
        };
        const serialized = [...serializePt5(model)];
        expect(serialized).toMatchSnapshot();
    });
});
