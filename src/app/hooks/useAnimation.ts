import { useEffect, useRef, useState } from "react";

interface UseAnimationOptions {
    duration: number;
    speed?: number;
    autoPlay?: boolean;
    onComplete?: () => void;
}

export function useAnimation({ duration, speed = 1, autoPlay = false, onComplete }: UseAnimationOptions) {
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [progress, setProgress] = useState(0);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const initialProgressRef = useRef<number>(0);

    useEffect(() => {
        if (isPlaying) {
            const animate = (timestamp: number) => {
                if (startTimeRef.current === null) {
                    startTimeRef.current = timestamp;
                }

                const elapsed = (timestamp - startTimeRef.current) * speed;
                const adjustedDuration = duration / speed;
                const newProgress = Math.min(1, initialProgressRef.current + elapsed / adjustedDuration);

                setProgress(newProgress);

                if (newProgress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setIsPlaying(false);
                    startTimeRef.current = null;
                    onComplete?.();
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
    }, [isPlaying, speed, duration, onComplete]);

    const play = () => {
        if (progress >= 1) {
            // Reset if at the end
            setProgress(0);
            initialProgressRef.current = 0;
        } else {
            initialProgressRef.current = progress;
        }
        startTimeRef.current = null;
        setIsPlaying(true);
    };

    const pause = () => {
        setIsPlaying(false);
    };

    const reset = () => {
        setIsPlaying(false);
        setProgress(0);
        initialProgressRef.current = 0;
        startTimeRef.current = null;
    };

    const toggle = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    return {
        isPlaying,
        progress,
        play,
        pause,
        reset,
        toggle,
    };
}

