import { describe, expect, it } from "vitest";
import { NcpCommandTypes, type NcpFile } from "../../ncp/model.ts";
import { ncpToPt5 } from "../ncpToPt5.ts";

describe("npcToPt5", () => {
    it("should convert simple file in absolute mode", () => {
        const input: NcpFile = {
            commands: [
                { commandType: NcpCommandTypes.SET_ABSOLUTE_MODE, args: {} },
                {
                    commandType: NcpCommandTypes.MOVE,
                    args: { X: 2, Y: 3 },
                },
                {
                    commandType: NcpCommandTypes.MOVE,
                    args: { X: 5, Y: 8 },
                },
                {
                    commandType: NcpCommandTypes.CLOCKWISE_CIRCLE,
                    args: { X: 8, I: 1.5 },
                },
                { commandType: NcpCommandTypes.END, args: {} },
            ],
        };

        expect(ncpToPt5(input)).toMatchSnapshot();
    });
});
