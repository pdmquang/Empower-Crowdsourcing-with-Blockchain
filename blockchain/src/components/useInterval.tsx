import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    // remember latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback])

    // Setup the interval
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (!delay && delay !== 0) {
            return
        }

        const id = setInterval(() => savedCallback.current(), delay)
        return () => clearInterval(id);

    }, [delay]);
}

export default useInterval;