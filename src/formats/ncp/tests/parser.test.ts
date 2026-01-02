import { parseNcp } from "../parser.ts";
import { describe, expect, it } from "vitest";
import * as fs from "node:fs/promises";

describe("parseNcp", () => {
    it.each(["simple", "switching_modes"])("should parse %s file", async (fileName) => {
        const fixtureUrl = new URL(`fixtures/${fileName}.ncp`, import.meta.url);
        const content = await fs.readFile(fixtureUrl, { encoding: "utf8" });
        const lines = content.split("\n");
        const parsed = parseNcp(lines);
        expect(parsed).toMatchSnapshot();
    });
});
