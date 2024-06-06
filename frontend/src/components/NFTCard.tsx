import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import moment from "moment";
import { getStateByKey } from "../contexts/transaction";
import { getNftMetaData } from "../contexts/utils";
import CardActionButton from "./CardActionButton";
import EndTimeCountdown from "./EndTimeCountdown";
import NFTCardSkeleton from "./NFTCardSkeleton";
import { SolanaIcon, VerifiedIcon } from "./svgIcons";

export default function NFTCard(props: {
    mint: string,
    raffleKey: string,
    twitter: string,
    showedDetail: boolean,
    showDetail: Function,
    setDetail: Function,
    raffleId: string,
    closeDetail: Function,
    wallet: WalletContextState,
    startLoading: Function,
    closeLoading: Function,
    updatePage: Function,
    keyword: string,
    headTab: string,
    collectionName: string,
    collectionId: string,
    raffleStatus: number,
    pageLoading: boolean
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [maxEntrants, setMaxEntrants] = useState(0);
    const [endTimestamp, setEndTimeStamp] = useState(new Date().getTime() / 1000);
    const [ticketPriceSol, setTicketPriceSol] = useState(0);
    const [winner, setWinner] = useState("");
    const [count, setCount] = useState(0);
    const [creator, setCreator] = useState("");
    const [claimed, setClaimed] = useState(0);

    const getNFTdetail = async () => {
        setIsLoading(true);
        const uri = await getNftMetaData(new PublicKey(props.mint))
        await fetch(uri)
            .then(resp =>
                resp.json()
            ).then((json) => {
                setImage(json.image);
                setName(json.name);
            })
            .catch((error) => {
                console.log(error);
            })
        const raffleDetail = await getStateByKey(new PublicKey(props.raffleKey));
        if (raffleDetail) {
            setMaxEntrants(raffleDetail.maxEntrants.toNumber());
            setEndTimeStamp(raffleDetail.endTimestamp.toNumber());
            setTicketPriceSol(raffleDetail.ticketPriceSol.toNumber() / LAMPORTS_PER_SOL);
            setWinner(raffleDetail.winner.toBase58());
            setCount(raffleDetail.count.toNumber());
            setCreator(raffleDetail.creator.toBase58());
            setClaimed(raffleDetail.claimed.toNumber());
        }
        setIsLoading(false);
    }

    const enterDetail = () => {
        props.setDetail({
            nftMint: props.mint,
            raffleKey: props.raffleKey,
            image: image,
            name: name,
            maxEntrants: maxEntrants,
            endTimestamp: endTimestamp,
            ticketPriceSol: ticketPriceSol,
            winner: winner,
            raffleId: props.raffleId,
            count: count,
            creator: creator,
            twitter: props.twitter,
            collectionName: props.collectionName,
            collectionId: props.collectionId,
            raffleStatus: props.raffleStatus
        })
        props.showDetail();
    }

    useEffect(() => {
        getNFTdetail();
        // eslint-disable-next-line
    }, [])

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
        name.toLowerCase().indexOf(props.keyword.toLowerCase()) !== -1 ?
            <div className="nft-card">
                {!isLoading ?
                    <div className="nft-card-content">
                        <div
                            className="media"
                            ref={cardRef}
                        >
                            {/* eslint-disable-next-line */}
                            <img
                                src={image}
                                alt=""
                                style={{ height: dimensions.width }}
                            />
                            <CardActionButton
                                claimed={claimed}
                                onCallback={() => enterDetail()}
                                winner={winner}
                                endTime={endTimestamp}
                                count={count}
                                maxEntrants={maxEntrants}
                            />
                        </div>
                        <div className="card-content">
                            <p className="collection">
                                {props.collectionName} <span><VerifiedIcon /></span>
                            </p>
                            <p className="nft-name">
                                {name.length < 24 ? name : name.slice(0, 24) + "..."}
                            </p>
                            <div className="entries-price">
                                {new Date() > new Date(endTimestamp * 1000) ?
                                    (
                                        count === 0 ?
                                            <div className="entries">
                                                <label>Tickets Sold</label>
                                                <p>Not sold</p>
                                            </div>
                                            :
                                            <div className="entries">
                                                <label>Tickets Sold</label>
                                                <p>{count} / {maxEntrants}</p>
                                            </div>
                                    )
                                    :
                                    <div className="entries">
                                        {count !== maxEntrants ?
                                            <>
                                                <label>Entries Left</label>
                                                <p>{maxEntrants - count} / {maxEntrants}</p>
                                            </>
                                            :
                                            <>
                                                <label>Tickets Sold</label>
                                                <p>{count} / {maxEntrants}</p>
                                            </>
                                        }
                                    </div>
                                }
                                <div className="price">
                                    <label>Ticket Price</label>
                                    <p>{ticketPriceSol} <SolanaIcon /></p>
                                </div>
                            </div>
                            <div className="card-bottom">
                                <CardActionButton
                                    claimed={claimed}
                                    onCallback={() => enterDetail()}
                                    winner={winner}
                                    endTime={endTimestamp}
                                    count={count}
                                    maxEntrants={maxEntrants}
                                />
                                <div className="end-time">
                                    <label>
                                        {new Date() > new Date(endTimestamp * 1000) ?
                                            "Ended"
                                            :
                                            "Ends in"
                                        }
                                    </label>
                                    {endTimestamp &&
                                        <p>
                                            <EndTimeCountdown endTime={moment(endTimestamp * 1000).format("yyyy-MM-DD HH:mm")} endAction={() => getNFTdetail()} />
                                        </p>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <NFTCardSkeleton />
                }
            </div >
            :
            <span style={{ display: "none" }}></span>
    )
}
