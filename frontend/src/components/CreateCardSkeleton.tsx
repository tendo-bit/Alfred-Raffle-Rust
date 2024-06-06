import { useLayoutEffect, useRef, useState } from "react";
import { Skeleton } from "@mui/material";

export default function CreateCardSkeleton() {
    const cardRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (cardRef.current) {
            setDimensions({
                width: cardRef.current.offsetWidth,
                height: cardRef.current.offsetHeight
            });
        }
    }, []);
    return (
        <div className="create-card">
            <div
                className="card-media"
                ref={cardRef}
                style={{ height: dimensions.width }}
            >
                <Skeleton variant="rectangular" width={dimensions.width} height={dimensions.width} style={{ background: "rgba(47, 82, 90, 0.5)", borderRadius: 8 }} />
            </div>
        </div>
    )
}
