export type NcpWord = [type: string, value: number];

export interface NcpLine {
    words: NcpWord[];
}

export interface NcpFile {
    lines: NcpLine[];
}
