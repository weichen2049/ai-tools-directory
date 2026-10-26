import { useState, useEffect } from "react";

export const ANIMATION_DURATION_MS = 500;


export function useSlideAnimation(trigger: any) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), ANIMATION_DURATION_MS);
        return () => clearTimeout(timer);
    }, [trigger]);

    return isAnimating;
}