import { type FC, type RefObject, useEffect, useRef } from "react";
import { useConvertedPt5 } from "../hooks/useConvertedPt5.ts";
import { pt5ToDrawing } from "../../formats/conversion/pt5ToDrawing.ts";
import "./DrawingPreview.css";
import { FormattedMessage } from "react-intl";

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

        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        const drawing = pt5ToDrawing(convertedPt5);

        ctx.reset();
        ctx.clearRect(0, 0, width, height);

        const padding = 10;
        const availableWidth = width - padding * 2;
        const availableHeight = height - padding * 2;

        const scale = Math.min(
            availableWidth / (drawing.boundingBox.maxX - drawing.boundingBox.minX),
            availableHeight / (drawing.boundingBox.maxY - drawing.boundingBox.minY),
        );
        ctx.scale(scale, scale);

        const scaledWidth = (drawing.boundingBox.maxX - drawing.boundingBox.minX) * scale;
        const scaledHeight = (drawing.boundingBox.maxY - drawing.boundingBox.minY) * scale;
        const offsetX = (availableWidth - scaledWidth) / (2 * scale) + padding / scale;
        const offsetY = (availableHeight - scaledHeight) / (2 * scale) + padding / scale;

        ctx.translate(-drawing.boundingBox.minX + offsetX, -drawing.boundingBox.minY + offsetY);

        ctx.lineWidth = 0.5 / scale;

        for (const segment of drawing.segments) {
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
        ctx.stroke();
    }, [convertedPt5, canvasRef]);

    return (
        <div>
            <FormattedMessage defaultMessage="Preview" id="drawingPreview.preview" tagName="h2" />
            <canvas className="drawing-preview-canvas" ref={canvasRef} width={600} height={600} />
        </div>
    );
};
