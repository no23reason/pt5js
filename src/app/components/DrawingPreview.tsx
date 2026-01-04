import { type FC, type RefObject, useEffect, useRef, useState } from "react";
import { useConvertedPt5 } from "../hooks/useConvertedPt5.ts";
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
    const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const initialProgressRef = useRef<number>(0);
    const previousPt5Ref = useRef<typeof convertedPt5>(null);

    useEffect(() => {
        if (!canvasRef.current || !convertedPt5) {
            return;
        }

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) {
            return;
        }

        const drawing = pt5ToDrawing(convertedPt5);
        drawDrawing(ctx, drawing, canvasRef.current.width, canvasRef.current.height, animationProgress);
    }, [convertedPt5, animationProgress]);

    // Auto-play animation when a new file is loaded
    useEffect(() => {
        if (convertedPt5 && convertedPt5 !== previousPt5Ref.current) {
            previousPt5Ref.current = convertedPt5;
            // Use setTimeout to defer state updates and avoid linter warning
            setTimeout(() => {
                setAnimationProgress(0);
                initialProgressRef.current = 0;
                startTimeRef.current = null;
                setIsPlaying(true);
            }, 0);
        }
    }, [convertedPt5]);

    useEffect(() => {
        if (isPlaying) {
            const animate = (timestamp: number) => {
                if (startTimeRef.current === null) {
                    startTimeRef.current = timestamp;
                }

                const elapsed = (timestamp - startTimeRef.current) * animationSpeed;
                const duration = DEFAULT_ANIMATION_DURATION;
                const newProgress = Math.min(1, initialProgressRef.current + elapsed / duration);

                setAnimationProgress(newProgress);

                if (newProgress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setIsPlaying(false);
                    startTimeRef.current = null;
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            startTimeRef.current = null;
        }

        return () => {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, animationSpeed]);

    const handlePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            if (animationProgress >= 1) {
                // Reset if at the end
                setAnimationProgress(0);
                initialProgressRef.current = 0;
            } else {
                initialProgressRef.current = animationProgress;
            }
            startTimeRef.current = null;
            setIsPlaying(true);
        }
    };

    return (
        <div>
            <FormattedMessage id="drawingPreview.preview" tagName="h2" />
            <div className="drawing-preview-controls">
                <button onClick={handlePlayPause}>
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
