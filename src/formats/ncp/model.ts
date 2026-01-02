export const NcpCommandTypes = {
    MOVE: "G01",
    CLOCKWISE_CIRCLE: "G02",
    COUNTER_CLOCKWISE_CIRCLE: "G03",
    SET_ABSOLUTE_MODE: "G90",
    SET_INCREMENTAL_MODE: "G91",
    STOP: "M00",
    END: "M02",
    STOP_AND_REWIND: "M30",
} as const;

export type NcpCommandType = (typeof NcpCommandTypes)[keyof typeof NcpCommandTypes];

export interface NcpCommand {
    commandType: NcpCommandType;
    args: Record<string, number>;
}

export interface NcpFile {
    commands: NcpCommand[];
}
