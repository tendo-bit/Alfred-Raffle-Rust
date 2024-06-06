import { useEffect, useState } from "react"
import { EMPTY_ADDRESS } from "../config";

export default function CardActionButton(props: {
    claimed: number,
    onCallback: Function,
    winner: string,
    endTime: number,
    count: number,
    maxEntrants: number
}) {
    const [status, setStatus] = useState(0);
    // 0 : view detail
    // 1 : show winner

    useEffect(() => {
        if (props.winner !== "") {
            if (props.endTime * 1000 > new Date().getTime()) {
                setStatus(0);
            } else {
                if (props.winner === EMPTY_ADDRESS) {
                    setStatus(2);
                } else {
                    setStatus(1);
                }
            }
        }
        if (props.count === props.maxEntrants) {
            setStatus(3)
        }
    }, [props.claimed, props.winner, props.endTime]);

    return (
        <>
            {status === 0 &&
                <button className="btn-round btn-dark" onClick={() => props.onCallback()}>
                    Enter Raffle
                </button>
            }
            {status === 2 &&
                <button className="btn-round btn-dark" onClick={() => props.onCallback()}>
                    View Raffle
                </button>
            }
            {
                status === 1 &&
                <div className="btn-round button-winner" onClick={() => props.onCallback()} title="View Detail">
                    <label>Winner</label>
                    <div className="">{props.winner.slice(0, 3)}..{props.winner.slice(-3)}</div>
                </div>
            }
            {status === 3 &&
                <button className="btn-round btn-dark" onClick={() => props.onCallback()}>
                    More Details
                </button>
            }
        </>
    )
}
