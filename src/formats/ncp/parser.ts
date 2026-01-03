import type { NcpFile, NcpWord } from "./model.ts";

export function parseNcp(rawLines: string[]): NcpFile {
    // Only parse numbered lines for now
    return {
        lines: rawLines
            .filter((rawLine) => rawLine.startsWith("N"))
            .map((rawLine) => ({ words: [...parseLine(rawLine)] })),
    };
}

function* parseLine(rawLine: string): Generator<NcpWord> {
    const parts = rawLine.trimEnd().split(" ");
    for (const part of parts) {
        const type = part[0];
        const value = part.slice(1);
        yield [type, Number.parseFloat(value)];
    }
}
