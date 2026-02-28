import { type FC, type RefObject, useEffect, useRef, useState } from "react";
import { useConvertedPt5 } from "../hooks/useConvertedPt5.ts";
import { useAnimation } from "../hooks/useAnimation.ts";
import { useAppState } from "../hooks/useAppState.ts";
import { pt5ToDrawing } from "../../formats/conversion/pt5ToDrawing.ts";
import type { Drawing, Segment } from "../../formats/drawing/model.ts";
import "./DrawingPreview.css";
import { FormattedMessage } from "react-intl";

const CANVAS_PADDING = 10;
const LINE_WIDTH = 0.5;
const DEFAULT_ANIMATION_DURATION = 3000; // milliseconds

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

function getArcStartPoint(segment: Segment): [number, number] {
    if (segment.type !== "arc") {
        throw new Error("Expected arc segment");
    }
    const startX = segment.x + segment.radius * Math.cos(segment.startAngle);
    const startY = segment.y + segment.radius * Math.sin(segment.startAngle);
    return [startX, startY];
}

function drawSegment(
    ctx: CanvasRenderingContext2D,
    segment: Segment,
    progress: number = 1,
    startX: number = 0,
    startY: number = 0,
) {
    switch (segment.type) {
        case "line":
            if (progress >= 1) {
                ctx.lineTo(segment.x, segment.y);
            } else {
                const x = startX + (segment.x - startX) * progress;
                const y = startY + (segment.y - startY) * progress;
                ctx.lineTo(x, y);
            }
            break;
        case "arc": {
            // Ensure we're at the start of the arc
            const [arcStartX, arcStartY] = getArcStartPoint(segment);
            // Only move if we're not already at the start point (within a small tolerance)
            const distToStart = Math.hypot(arcStartX - startX, arcStartY - startY);
            if (distToStart > 0.001) {
                ctx.lineTo(arcStartX, arcStartY);
            }

            if (progress >= 1) {
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
            } else {
                const angleDiff = segment.endAngle - segment.startAngle;
                const adjustedAngleDiff = segment.counterClockwise
                    ? angleDiff < 0
                        ? angleDiff
                        : angleDiff - 2 * Math.PI
                    : angleDiff > 0
                      ? angleDiff
                      : angleDiff + 2 * Math.PI;
                const endAngle = segment.startAngle + adjustedAngleDiff * progress;
                ctx.ellipse(
                    segment.x,
                    segment.y,
                    segment.radius,
                    segment.radius,
                    0,
                    segment.startAngle,
                    endAngle,
                    segment.counterClockwise,
                );
            }
            break;
        }
    }
}

function getSegmentEndPoint(segment: Segment): [number, number] {
    switch (segment.type) {
        case "line":
            return [segment.x, segment.y];
        case "arc": {
            const endX = segment.x + segment.radius * Math.cos(segment.endAngle);
            const endY = segment.y + segment.radius * Math.sin(segment.endAngle);
            return [endX, endY];
        }
    }
}

function drawDrawing(
    ctx: CanvasRenderingContext2D,
    drawing: Drawing,
    canvasWidth: number,
    canvasHeight: number,
    animationProgress: number = 1,
) {
    ctx.reset();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const { scale, offsetX, offsetY } = calculateScaleAndOffset(
        canvasWidth,
        canvasHeight,
        drawing.boundingBox,
    );

    // Set up coordinate system:
    // 1. Translate to bottom of canvas (flip Y origin from top-left to bottom-left)
    // 2. Scale Y by -1 to flip Y axis (drawing has Y=0 at bottom, canvas has Y=0 at top)
    // 3. Apply uniform scale
    // 4. Translate to position the drawing
    ctx.translate(0, canvasHeight);
    ctx.scale(1, -1);
    ctx.scale(scale, scale);
    ctx.translate(-drawing.boundingBox.minX + offsetX / scale, -drawing.boundingBox.minY + offsetY / scale);

    ctx.lineWidth = LINE_WIDTH / scale;
    ctx.beginPath();

    if (animationProgress >= 1) {
        // Draw all segments
        ctx.moveTo(0, 0);
        for (const segment of drawing.segments) {
            drawSegment(ctx, segment);
        }
        ctx.stroke();
    } else {
        // Animate drawing
        const totalSegments = drawing.segments.length;
        const segmentsToDraw = Math.floor(animationProgress * totalSegments);
        const partialProgress = (animationProgress * totalSegments) % 1;

        let currentX = 0;
        let currentY = 0;

        // Start at origin
        if (segmentsToDraw > 0 || partialProgress > 0) {
            ctx.moveTo(currentX, currentY);
        }

        // Draw complete segments
        for (let i = 0; i < segmentsToDraw; i++) {
            const segment = drawing.segments[i];
            drawSegment(ctx, segment, 1, currentX, currentY);
            [currentX, currentY] = getSegmentEndPoint(segment);
        }

        // Draw partial segment if needed
        if (segmentsToDraw < totalSegments && partialProgress > 0) {
            const segment = drawing.segments[segmentsToDraw];
            drawSegment(ctx, segment, partialProgress, currentX, currentY);
        }

        ctx.stroke();
    }
}

export const DrawingPreview: FC = () => {
    const convertedPt5 = useConvertedPt5();
    const ncpLoadCount = useAppState((state) => state.ncpLoadCount);
    const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const previousLoadCountRef = useRef(0);

    const { isPlaying, progress, toggle, reset } = useAnimation({
        duration: DEFAULT_ANIMATION_DURATION,
        speed: animationSpeed,
    });

    useEffect(() => {
        if (!canvasRef.current || !convertedPt5) {
            return;
        }

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) {
            return;
        }

        const drawing = pt5ToDrawing(convertedPt5);
        drawDrawing(ctx, drawing, canvasRef.current.width, canvasRef.current.height, progress);
    }, [convertedPt5, progress]);

    // Auto-play animation when a new NCP file is loaded
    useEffect(() => {
        if (ncpLoadCount > 0 && ncpLoadCount !== previousLoadCountRef.current) {
            previousLoadCountRef.current = ncpLoadCount;
            reset();
            setTimeout(() => toggle(), 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ncpLoadCount]);

    return (
        <div>
            <FormattedMessage id="drawingPreview.preview" tagName="h2" />
            <div className="drawing-preview-controls">
                <button onClick={toggle}>
                    {isPlaying ? (
                        <FormattedMessage id="drawingPreview.pause" />
                    ) : (
                        <FormattedMessage id="drawingPreview.play" />
                    )}
                </button>
                <label className="drawing-preview-speed-label">
                    <FormattedMessage id="drawingPreview.speed" />:
                    <input
                        type="range"
                        min="0.25"
                        max="3"
                        step="0.25"
                        value={animationSpeed}
                        onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                        className="drawing-preview-speed-slider"
                    />
                    <span className="drawing-preview-speed-value">{animationSpeed.toFixed(2)}x</span>
                </label>
            </div>
            <canvas className="drawing-preview-canvas" ref={canvasRef} width={600} height={600} />
            <FormattedMessage id="drawingPreview.previewDisclaimer" />
        </div>
    );
};
