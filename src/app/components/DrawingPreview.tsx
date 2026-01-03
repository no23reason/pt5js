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

        const scale = Math.min(
            width / (drawing.boundingBox.maxX - drawing.boundingBox.minX),
            height / (drawing.boundingBox.maxY - drawing.boundingBox.minY),
        );
        ctx.scale(scale, scale);

        const scaledWidth = (drawing.boundingBox.maxX - drawing.boundingBox.minX) * scale;
        const scaledHeight = (drawing.boundingBox.maxY - drawing.boundingBox.minY) * scale;
        const offsetX = (width - scaledWidth) / (2 * scale);
        const offsetY = (height - scaledHeight) / (2 * scale);

        ctx.translate(-drawing.boundingBox.minX + offsetX, -drawing.boundingBox.minY + offsetY);

        ctx.lineWidth = 0.5 / scale;

        for (const segment of drawing.segments) {
            switch (segment.type) {
                case "line":
                    ctx.lineTo(segment.x, segment.y);
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
