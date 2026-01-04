import { type FC, type RefObject, useEffect, useRef } from "react";
import { useConvertedPt5 } from "../hooks/useConvertedPt5.ts";
import { pt5ToDrawing } from "../../formats/conversion/pt5ToDrawing.ts";
import type { Drawing, Segment } from "../../formats/drawing/model.ts";
import "./DrawingPreview.css";
import { FormattedMessage } from "react-intl";

const CANVAS_PADDING = 10;
const LINE_WIDTH = 0.5;

function calculateScaleAndOffset(
    canvasWidth: number,
    canvasHeight: number,
    boundingBox: Drawing["boundingBox"],
) {
    const drawingWidth = boundingBox.maxX - boundingBox.minX;
    const drawingHeight = boundingBox.maxY - boundingBox.minY;

    const availableWidth = canvasWidth - CANVAS_PADDING * 2;
    const availableHeight = canvasHeight - CANVAS_PADDING * 2;

    // Handle edge case: zero-size drawing
    if (drawingWidth === 0 || drawingHeight === 0) {
        return {
            scale: 1,
            offsetX: canvasWidth / 2,
            offsetY: canvasHeight / 2,
        };
    }

    const scale = Math.min(availableWidth / drawingWidth, availableHeight / drawingHeight);

    // Center the drawing in the canvas
    const scaledWidth = drawingWidth * scale;
    const scaledHeight = drawingHeight * scale;
    const offsetX = (availableWidth - scaledWidth) / 2 + CANVAS_PADDING;
    const offsetY = (availableHeight - scaledHeight) / 2 + CANVAS_PADDING;

    return { scale, offsetX, offsetY };
}

function drawSegment(ctx: CanvasRenderingContext2D, segment: Segment) {
    switch (segment.type) {
        case "line":
            ctx.lineTo(segment.x, segment.y);
            break;
        case "arc":
            ctx.ellipse(
                segment.x,
                segment.y,
                segment.radius,
                segment.radius,
                0,
                segment.startAngle,
                segment.endAngle,
                segment.counterClockwise,
            );
            break;
    }
}

function drawDrawing(
    ctx: CanvasRenderingContext2D,
    drawing: Drawing,
    canvasWidth: number,
    canvasHeight: number,
) {
    ctx.reset();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const { scale, offsetX, offsetY } = calculateScaleAndOffset(
        canvasWidth,
        canvasHeight,
        drawing.boundingBox,
    );

    // Set up coordinate system: scale first, then translate
    ctx.scale(scale, scale);
    ctx.translate(-drawing.boundingBox.minX + offsetX / scale, -drawing.boundingBox.minY + offsetY / scale);

    ctx.lineWidth = LINE_WIDTH / scale;
    ctx.beginPath();

    for (const segment of drawing.segments) {
        drawSegment(ctx, segment);
    }

    ctx.stroke();
}

export const DrawingPreview: FC = () => {
    const convertedPt5 = useConvertedPt5();
    const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !convertedPt5) {
            return;
        }

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) {
            return;
        }

        const drawing = pt5ToDrawing(convertedPt5);
        drawDrawing(ctx, drawing, canvasRef.current.width, canvasRef.current.height);
    }, [convertedPt5]);

    return (
        <div>
            <FormattedMessage id="drawingPreview.preview" tagName="h2" />
            <canvas className="drawing-preview-canvas" ref={canvasRef} width={600} height={600} />
            <FormattedMessage id="drawingPreview.previewDisclaimer" />
        </div>
    );
};
