import { useLayoutEffect, useRef, useState } from "react";
import { Skeleton } from "@mui/material";

export default function NFTCardSkeleton() {
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
        <div className="nft-card-content">
            <div
                className="media"
                ref={cardRef}
                style={{ height: dimensions.width }}
            >
                <Skeleton animation="wave" variant="rectangular" width={dimensions.width} height={dimensions.width - 4} style={{ background: "#2f525a17", borderRadius: 8 }} />
                <div className="mobile-card-load">
                    <Skeleton animation="wave" variant="rectangular" width={dimensions.width} height={56} style={{ background: "#2f525a17", borderRadius: 4, marginTop: 4 }} />
                </div>
            </div>
            <div className="card-content">
                <p className="collection">
                    <Skeleton animation="wave" variant="rectangular" width={120} height={16} style={{ background: "#2f525a17", borderRadius: 4, marginBottom: 4 }} />
                </p>
                <p className="nft-name">
                    <Skeleton animation="wave" variant="rectangular" width={160} height={20} style={{ background: "#2f525a17", borderRadius: 4, marginBottom: 4 }} />
                </p>
                <div className="entries-price">
                    <div className="entries">
                        <label>
                            <Skeleton animation="wave" variant="rectangular" width={74} height={14.4} style={{ background: "#2f525a00", borderRadius: 4 }} />
                        </label>
                        <p><Skeleton animation="wave" variant="rectangular" width={80} height={18} style={{ background: "#2f525a00", borderRadius: 4, marginTop: 4 }} /></p>
                    </div>
                    <div className="price">
                        <label><Skeleton animation="wave" variant="rectangular" width={74} height={14.4} style={{ background: "#2f525a00", borderRadius: 4 }} /></label>
                        <p><Skeleton animation="wave" variant="rectangular" width={20} height={18} style={{ background: "#2f525a00", borderRadius: 4 }} /></p>
                    </div>
                </div>
                <div className="card-bottom">
                    <Skeleton animation="wave" variant="rectangular" height={56} style={{ background: "#2f525a17", borderRadius: 16, width: "calc(50% - 8px)" }} />
                    <div className="end-time">
                        <label><Skeleton animation="wave" variant="rectangular" width={60} height={18} style={{ background: "#2f525a17", borderRadius: 4 }} /></label>
                        <p><Skeleton animation="wave" variant="rectangular" height={20} style={{ background: "#2f525a17", borderRadius: 4, width: "100%", marginTop: 4 }} /></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
