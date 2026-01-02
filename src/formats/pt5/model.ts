export const Pt5CommandTypes = {
    MOVE: "G01",
    CLOCKWISE_CIRCLE: "G02",
    COUNTER_CLOCKWISE_CIRCLE: "G03",
    STOP: "M00",
    END: "M02",
    STOP_AND_REWIND: "M30",
} as const;

export type Pt5CommandType = (typeof Pt5CommandTypes)[keyof typeof Pt5CommandTypes];

export interface Pt5Command {
    commandType: Pt5CommandType;
    args: Record<string, number>;
}

export interface Pt5File {
    commands: Pt5Command[];
}
