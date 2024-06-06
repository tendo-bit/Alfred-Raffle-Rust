import { ClickAwayListener } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../api/firebase";
import { EMPTY_ADDRESS } from "../config";
import { buyTicket, claimReward, getGlobalAllData, getStateByKey, revealWinner, withdrawNft } from "../contexts/transaction";
import { RaffleDetailType } from "../contexts/types";
import { getNftMetaData } from "../contexts/utils";
import CopyAddress from "./CopyAddress";
import EndTimeCountdown from "./EndTimeCountdown";
import NFTCard from "./NFTCard";
import RaffleDetailActionButton from "./RaffleDetailActionButton";
import { BackIcon, DownIcon, SolanaIcon, TwitterIcon, UserIcon, VerifiedIcon, WinnerIcon } from "./svgIcons";
import { infoAlertBottom, successAlertBottom } from "./toastGroup";

export default function RaffleDetail(props: {
    showedDetail: boolean,
    showDetail: Function,
    closeDetail: Function,
    raffleDetail: RaffleDetailType,
    startLoading: Function,
    closeLoading: Function,
    getGlobalData: Function,
    setDetail: Function,
    pageLoading: boolean
}) {
    const { showedDetail, closeDetail, raffleDetail, startLoading, closeLoading } = props;
    const wallet = useWallet();
    const [amount, setAmount] = useState(1);
    const [tab, setTab] = useState("terms");
    const [description, setDescription] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [externalUrl, setExternalUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [buyers, setBuyers] = useState([]);
    const [claimed, setClaimed] = useState(0);
    const [winner, setWinner] = useState(EMPTY_ADDRESS);
    const [endTimeStamp, setEndTimeStamp] = useState(new Date().getTime());
    const [raffleId, setRaffleId] = useState("");
    const [image, setImage] = useState("");
    const [count, setCount] = useState(0);
    const [name, setName] = useState("");
    const [solPrice, setSolPrice] = useState(0);

    const [tabMobileShow, setTabMobileShow] = useState(false);
    const [tabName, setTabName] = useState("Terms")
    const [showCreatorProfile, setShowCreatorProfile] = useState(false);
    const [creatorProfile, setCreatorProfile] = useState<any>([]);

    const handleAmount = (e: any) => {
        setAmount(e.target.value);
    }
    const handleShow = () => {
        if (showedDetail) {
            closeDetail();
        }
    }
    const handleMobileTab = (name: string) => {
        setTabMobileShow(false);
        setTab(name);
        if (name === "terms") setTabName("Terms")
        if (name === "meta-data") setTabName("Meta Data")
        if (name === "participants") setTabName("Participants")
    }
    const getRaffleDetail = async () => {
        setIsLoading(true);
        if (raffleDetail.nftMint === "") {
            setIsLoading(false);
            return;
        }
        const uri = await getNftMetaData(new PublicKey(raffleDetail.nftMint))

        await fetch(uri)
            .then(resp =>
                resp.json()
            ).then((json) => {
                setImage(json.image);
                setName(json.name);
                setDescription(json.description);
                setAttributes(json.attributes);
                setExternalUrl(json.external_url);
            })
            .catch((error) => {
                console.log(error);
            })
        const raffleData = await getStateByKey(new PublicKey(raffleDetail.raffleKey))
        if (!raffleData) return;
        let entrants = [];
        let buyerList: any = [];
        if (raffleData.count.toNumber() !== 0) {
            for (let i = 0; i < raffleData.count.toNumber(); i++) {
                entrants.push(raffleData.entrants[i].toBase58());
            }
            const res = entrants.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));

            for (let i = 0; i < Object.keys(res).length; i++) {
                buyerList.push({
                    address: Object.keys(res)[i],
                    count: res[Object.keys(res)[i]]
                })
            }
            buyerList.sort((a: any, b: any) => b.count - a.count);
        }
        setEndTimeStamp(raffleData.endTimestamp.toNumber() * 1000);
        setClaimed(raffleData.claimed.toNumber());
        setWinner(raffleData.winner.toBase58());
        setCount(raffleData.count.toNumber());
        setSolPrice(raffleData.ticketPriceSol.toNumber() / LAMPORTS_PER_SOL);
        // if (raffleData.claimed.toNumber() === 1 && raffleData.winner.toBase58() !== EMPTY_ADDRESS) setIsWidraw(true);

        setBuyers(buyerList);
        setIsLoading(false);
    }

    const getCreatorProfileData = async () => {
        try {
            const data = await getGlobalAllData();
            let profileList = [];
            if (data && data.length !== 0) {
                for (let item of data) {
                    if (item) {
                        let dbData: any = [];
                        const q = query(collection(db, "raffles"), where("raffleKey", "==", item?.raffleKey));
                        const querySnapshot = await getDocs(q);
                        querySnapshot.forEach((doc) => {
                            dbData = doc.data();
                            dbData.id = doc.id;
                            setRaffleId(dbData.id);
                        });
                        if (item.creator.toBase58() === raffleDetail.creator)
                            profileList.push({
                                nftMint: item.nftMint.toBase58(),
                                raffleKey: item.raffleKey,
                                endTimestamp: item.endTimestamp.toNumber(),
                                createTimeStamp: dbData.createTimeStamp,
                                twitter: dbData.twitter,
                                ticketPriceSol: item.ticketPriceSol.toNumber() / LAMPORTS_PER_SOL,
                                id: dbData.id,
                                collectionName: props.raffleDetail.collectionName,
                                collectionId: props.raffleDetail.collectionId
                            })
                    }
                }
            }
            setCreatorProfile(profileList);
        } catch (error) {
            console.log(error);
        }
    }


    const updatePage = () => {
        closeDetail();
        props.getGlobalData();
    }

    const onWidrawNft = async () => {
        try {
            await withdrawNft(wallet, new PublicKey(raffleDetail.raffleKey), new PublicKey(raffleDetail.raffleKey), raffleDetail.raffleId, () => startLoading(), () => closeLoading(), () => updatePage())
        } catch (error) {
            console.log(error);
        }
    }

    const onRevealWinner = async () => {
        try {
            await revealWinner(wallet, new PublicKey(raffleDetail.raffleKey), () => startLoading(), () => closeLoading(), () => updatePage(), raffleDetail.raffleId);
        } catch (error) {
            console.log(error);
        }
    }

    const onClaimNft = async () => {
        try {
            await claimReward(wallet, new PublicKey(raffleDetail.nftMint), new PublicKey(raffleDetail.raffleKey), () => startLoading(), () => closeLoading(), () => updatePage(), raffleDetail.raffleId)
        } catch (error) {
            console.log(error);
        }
    }

    const buyTickets = async () => {
        if (!wallet.publicKey) return;
        try {
            await buyTicket(wallet, new PublicKey(raffleDetail.raffleKey), amount, raffleDetail.raffleId, () => startLoading(), () => closeLoading(), () => updatePage());
        } catch (error) {
            console.log(error);
        }
    }

    const profileCardShow = () => {
        props.showDetail();
        setShowCreatorProfile(false);
    }

    useEffect(() => {
        const q = query(collection(db, "raffles"), where("raffleKey", "==", raffleDetail.raffleKey));
        onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                infoAlertBottom("Refreshing Raffle...")
                getRaffleDetail();
                getCreatorProfileData();
            });
        });
        return;
        // eslint-disable-next-line
    }, [raffleDetail])

    return (
        <div className="raffle-detail">
            <div className="dark-overlay" style={{ opacity: showedDetail ? 1 : 0, pointerEvents: !showedDetail ? "none" : "all" }} onClick={() => handleShow()}></div>
            <div className="raffle-detail-content" style={{ transform: `translateX(${showedDetail ? "0" : "100%"})` }}>

                {!showCreatorProfile ?
                    <>
                        {!isLoading ?
                            <>

                                <div className="content-header">
                                    <button className="icon-button btn-dark" onClick={() => handleShow()}>
                                        <BackIcon />
                                    </button>
                                    <div className="detail-name">
                                        <label>{props.raffleDetail.collectionName} <VerifiedIcon color="#0265DA" /></label>
                                        <p>{name}</p>
                                    </div>
                                </div>

                                <div className="nft-detail">
                                    <div className="media">
                                        {/* eslint-disable-next-line */}
                                        <img
                                            src={image}
                                            alt=""
                                        />
                                    </div>
                                    <div className="nft-detail-content">
                                        {wallet.publicKey !== null &&
                                            <>
                                                {winner !== EMPTY_ADDRESS && count !== 0 &&
                                                    (winner !== wallet.publicKey?.toBase58() ?
                                                        <div className="detail-row">
                                                            <label><WinnerIcon /><span className="winner-label">Winner</span></label>
                                                            <CopyAddress address={winner} length={5} />
                                                        </div>
                                                        :
                                                        <div className="detail-row" style={{ marginBottom: 15 }}>
                                                            <label><WinnerIcon /><span className="winner-label">You win!</span></label>
                                                        </div>
                                                    )
                                                }
                                            </>
                                        }
                                        <div className="ticket-buy">
                                            {wallet.publicKey === null ?
                                                <div className="detail-wallet">
                                                    <WalletModalProvider>
                                                        <WalletMultiButton />
                                                    </WalletModalProvider>
                                                </div>
                                                :
                                                <>
                                                    {new Date() < new Date(raffleDetail.endTimestamp * 1000) &&
                                                        <input
                                                            className="ticket-number-input"
                                                            type={"number"}
                                                            value={amount}
                                                            min={1}
                                                            max={raffleDetail.maxEntrants}
                                                            onChange={handleAmount}
                                                        />
                                                    }
                                                    <RaffleDetailActionButton
                                                        claimed={claimed}
                                                        winner={winner}
                                                        endTime={endTimeStamp}
                                                        count={raffleDetail.count}
                                                        loading={props.pageLoading}
                                                        buyTickets={() => buyTickets()}
                                                        revealWinner={() => onRevealWinner()}
                                                        claimReward={() => onClaimNft()}
                                                        withdrawNft={() => onWidrawNft()}
                                                        raffleId={raffleId}
                                                        creator={raffleDetail.creator}
                                                        walletAddress={wallet.publicKey.toBase58()}
                                                        raffleKey={raffleDetail.raffleKey}
                                                        raffleStatus={raffleDetail.raffleStatus}
                                                    />
                                                </>
                                            }
                                        </div>
                                        <div className="detail-row">
                                            <label>Ticket Price</label>
                                            <p>{solPrice} <SolanaIcon /></p>
                                        </div>
                                        <div className="detail-row">
                                            {count === raffleDetail.maxEntrants ?
                                                <>
                                                    <label>Tickets Sold</label>
                                                    <p>{count} / {raffleDetail.maxEntrants}</p>
                                                </>
                                                :
                                                <>
                                                    {new Date() > new Date(endTimeStamp) ?
                                                        <>
                                                            <label>Tickts Sold</label>
                                                            <p>{count} / {raffleDetail.maxEntrants}</p>
                                                        </>
                                                        :
                                                        <>
                                                            <label>Entries Left</label>
                                                            <p>{raffleDetail.maxEntrants - count} / {raffleDetail.maxEntrants}</p>
                                                        </>
                                                    }
                                                </>
                                            }
                                        </div>
                                        <div className="detail-row">
                                            <label>
                                                {new Date() > new Date(endTimeStamp) ?
                                                    "Ended"
                                                    :
                                                    "Ends in"
                                                }
                                            </label>
                                            <p>
                                                <EndTimeCountdown endTime={moment(endTimeStamp).format("yyyy-MM-DD HH:mm")} endAction={() => getRaffleDetail()} />
                                            </p>
                                        </div>
                                        <div className="raffle-social">
                                            <button onClick={() => setShowCreatorProfile(true)}>
                                                <UserIcon />
                                            </button>
                                            {raffleDetail.twitter !== "" &&
                                                <Link href={raffleDetail.twitter}>
                                                    <a>
                                                        <TwitterIcon />
                                                    </a>
                                                </Link>
                                            }
                                            <div className="detail-row">
                                                <label>Raffler</label>
                                                <CopyAddress address={raffleDetail.creator} length={5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-tabs">
                                    <div className="tabs-header">
                                        <button
                                            className={tab === "terms" ? "btn-tab tab-selected" : "btn-tab"}
                                            onClick={() => setTab("terms")}
                                        >
                                            Terms
                                        </button>
                                        <button
                                            className={tab === "meta-data" ? "btn-tab tab-selected" : "btn-tab"}
                                            onClick={() => setTab("meta-data")}
                                        >
                                            Meta Data
                                        </button>
                                        <button
                                            className={tab === "participants" ? "btn-tab tab-selected" : "btn-tab"}
                                            onClick={() => setTab("participants")}
                                        >
                                            Participants
                                        </button>
                                    </div>
                                    <div className="mobile-detail-tab">
                                        <ClickAwayListener onClickAway={() => setTabMobileShow(false)}>
                                            <div className="state-dropdown">
                                                <div className="title" onClick={() => setTabMobileShow(true)}><span>{tabName}</span> <DownIcon /></div>
                                                {tabMobileShow &&
                                                    <div className="state-dropdown-content">
                                                        <button onClick={() => handleMobileTab("terms")}>Terms</button>
                                                        <button onClick={() => handleMobileTab("meta-data")}>Meta Data</button>
                                                        <button onClick={() => handleMobileTab("participants")}>Participants</button>
                                                    </div>
                                                }
                                            </div>
                                        </ClickAwayListener>
                                    </div>

                                    <div className="tab-content">
                                        {tab === "terms" &&
                                            <>
                                                <p className="terms-description">All NFT prizes are held by rafffle in escrow and can be claimed by the winner or creator once the draw is done.</p>
                                                <p className="terms-description">Raffle tickets cannot be refunded once bought.</p>
                                                <p className="terms-description">Raffle tickets will not be refunded if you did not win the raffle.</p>
                                            </>
                                        }
                                        {
                                            tab === "meta-data" && (!isLoading ?
                                                <div className="detail-metadata">
                                                    <div className="nft-attribute">
                                                        <h4>Properties</h4>
                                                        <div className="nft-attribute-list">
                                                            {attributes && attributes.length !== 0 && attributes.map((item: any, key) => (
                                                                <div className="attribute-item" key={key}>
                                                                    <label>{item.trait_type}</label>
                                                                    <p>{item.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="detail-description">
                                                        <h4>Description</h4>
                                                        <p>{description}</p>
                                                        {externalUrl !== "" &&
                                                            <Link href={externalUrl}>
                                                                <a>
                                                                    {externalUrl.split("://")[1]}
                                                                </a>
                                                            </Link>
                                                        }
                                                    </div>
                                                </div>
                                                :
                                                <div className="detail-metadata">
                                                    <p className="loading-p">Loading...</p>
                                                </div>
                                            )
                                        }
                                        {
                                            tab === "participants" && (!isLoading ?
                                                <div className="detail-participants">
                                                    <table className="tickets-sold">
                                                        <thead>
                                                            <tr>
                                                                <th align="left">Wallet</th>
                                                                <th align="right">Tickets</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {buyers && buyers.length !== 0 && buyers.map((item: any, key: number) => (
                                                                <tr key={key}>
                                                                    <td align="left"><CopyAddress address={item.address} /></td>
                                                                    <td align="right">{item.count}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                :
                                                <div className="detail-participants">
                                                    <p className="loading-p">Loading...</p>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </>
                            :

                            <div className="detail-loading">
                                <div className="lds-roller">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>
                        }
                    </>
                    :
                    <>
                        <div className="content-header">
                            <button className="icon-button btn-dark" onClick={() => setShowCreatorProfile(false)}>
                                <BackIcon />
                            </button>
                            <div className="detail-name">
                                <label>{raffleDetail.creator.slice(0, 4)}..{raffleDetail.creator.slice(-4)}</label>
                                <p><TwitterIcon color="#2F525A" />@{raffleDetail.twitter.split("https://twitter.com/")[1]}</p>
                            </div>
                        </div>
                        <div className="profile-content">
                            {creatorProfile && creatorProfile.length !== 0 && creatorProfile.map((item: any, key: number) => (
                                <NFTCard
                                    key={key}
                                    mint={item.nftMint}
                                    raffleKey={item.raffleKey}
                                    twitter={item.twitter}
                                    raffleId={item.id}
                                    showDetail={() => profileCardShow()}
                                    showedDetail={props.showedDetail}
                                    closeDetail={props.closeDetail}
                                    setDetail={props.setDetail}
                                    raffleStatus={item.raffleStatus}
                                    wallet={wallet}
                                    startLoading={() => startLoading()}
                                    closeLoading={() => closeLoading()}
                                    updatePage={() => props.getGlobalData()}
                                    collectionName={item.collectionName}
                                    collectionId={item.collectionId}
                                    keyword={""}
                                    headTab={""}
                                    pageLoading={props.pageLoading}
                                />
                            ))}
                        </div>
                    </>
                }
            </div>
        </div >
    )
}
