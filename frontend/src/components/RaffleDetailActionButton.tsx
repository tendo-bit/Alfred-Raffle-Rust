import { useEffect, useState } from "react"
import { HashLoader } from "react-spinners";
import { EMPTY_ADDRESS } from "../config";

export default function RaffleDetailActionButton(props: {
    claimed: number,
    winner: string,
    count: number,
    endTime: number,
    loading?: boolean,
    buyTickets: Function,
    revealWinner: Function,
    claimReward: Function,
    withdrawNft: Function,
    raffleId: string,
    creator: string,
    walletAddress: string,
    raffleKey: string,
    raffleStatus: number,
}) {
    const { claimed, winner, count, endTime, loading, buyTickets, revealWinner, claimReward, withdrawNft, raffleId, creator, walletAddress, raffleKey, raffleStatus } = props
    const [status, setStatus] = useState(4);
    // 0 : buy tickets
    // 1 : raveal winner
    // 2 : withdraw NFT
    // 3 : claim NFT
    // 4 : no action

    // ----- claimed status -----
    // 0 : normal
    // 1 : claimed
    // 2 : reveal winner
    // 3 : widrawed NFT

    useEffect(() => {
        if (endTime > new Date().getTime()) {
            setStatus(0);
        } else {
            if (count === 0) {
                if (creator === walletAddress) {
                    setStatus(2);
                }
            } else {
                if (winner === EMPTY_ADDRESS) {
                    setStatus(1);
                } else if (walletAddress === winner) {
                    if (claimed !== 1) {
                        setStatus(3);
                    } else if (claimed === 1) {
                        setStatus(4);
                    }
                }

            }
        }
    }, [claimed, winner, endTime, count, raffleStatus]);

    return (
        <>
            {status === 0 &&
                <button
                    className={`btn-buy ${loading && "display-center"}`}
                    onClick={() => buyTickets()}
                    disabled={loading}
                >
                    {!loading ?
                        <span>buy raffle tickets</span>
                        :
                        <><HashLoader color={"#fff"} size={18} /><span style={{ marginLeft: 5 }}>Buying...</span></>
                    }
                </button>
            }
            {status === 1 &&
                <button
                    className={`btn-buy btn-full ${loading && "display-center"}`}
                    onClick={() => revealWinner()}
                    disabled={loading}
                >
                    {!loading ?
                        <span>Reveal Winner</span>
                        :
                        <><HashLoader color={"#fff"} size={18} /><span style={{ marginLeft: 5 }}>Revealing...</span></>
                    }
                </button>
            }
            {status === 2 &&
                <button
                    className={`btn-buy btn-full ${loading && "display-center"}`}
                    onClick={() => withdrawNft()}
                    disabled={loading}
                >
                    {!loading ?
                        <span style={{ textTransform: "none" }}>Withdraw NFT</span>
                        :
                        <><HashLoader color={"#fff"} size={18} /><span style={{ marginLeft: 5 }}>Withdrawing...</span></>
                    }
                </button>
            }
            {status === 3 &&
                <button
                    className={`btn-buy btn-full ${loading && "display-center"}`}
                    onClick={() => claimReward()}
                    disabled={loading}
                >
                    {!loading ?
                        <span style={{ textTransform: "none" }}>Claim NFT</span>
                        :
                        <><HashLoader color={"#fff"} size={18} /><span style={{ marginLeft: 5 }}>Claiming...</span></>
                    }
                </button>
            }
        </>
    )
}
