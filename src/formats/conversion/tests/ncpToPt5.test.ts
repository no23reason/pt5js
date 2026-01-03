import { describe, expect, it } from "vitest";
import { type NcpFile } from "../../ncp/model.ts";
import { ncpToPt5 } from "../ncpToPt5.ts";

describe("npcToPt5", () => {
    it("should convert simple file in absolute mode", () => {
        const input: NcpFile = {
            lines: [
                {
                    words: [
                        ["G", 90],
                        ["G", 1],
                        ["X", 2],
                        ["Y", 3],
                    ],
                },
                {
                    words: [
                        ["G", 1],
                        ["X", 5],
                        ["Y", 8],
                    ],
                },
                {
                    words: [
                        ["G", 2],
                        ["X", 8],
                        ["I", 1.5],
                    ],
                },
            ],
        };

        expect(ncpToPt5(input)).toMatchSnapshot();
    });
});
