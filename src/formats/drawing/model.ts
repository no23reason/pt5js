export interface LineTo {
    type: "line";
    x: number;
    y: number;
}

export interface Arc {
    type: "arc";
    x: number;
    y: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    counterClockwise: boolean;
}

export type Segment = LineTo | Arc;

export interface Drawing {
    segments: Segment[];
    boundingBox: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
}
