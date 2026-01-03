export interface LineTo {
    type: "line";
    x: number;
    y: number;
}

// TODO arc/ellipsis

export type Segment = LineTo;

export interface Drawing {
    segments: Segment[];
    boundingBox: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
}
