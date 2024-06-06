import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../api/firebase";
import { getGlobalAllData } from "../contexts/transaction";
import { RaffleDetailType } from "../contexts/types";
import NFTCard from "./NFTCard";
import NFTCardSkeleton from "./NFTCardSkeleton";
import { BackIcon, FingerPrintIcon } from "./svgIcons";

export default function MyRaffleList(props: {
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

    const [creatorProfile, setCreatorProfile] = useState<any>([]);
    const [wonRaffles, setWonRaffles] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState("mine");

    const handleShow = () => {
        if (showedDetail) {
            closeDetail();
        }
    }

    const getCreatorProfileData = async () => {
        if (wallet.publicKey === null) return;
        try {
            setIsLoading(true);
            const data = await getGlobalAllData();
            let profileList = [];
            let wons = [];
            if (data && data.length !== 0) {
                for (let item of data) {
                    if (item) {
                        let dbData: any = [];
                        const q = query(collection(db, "raffles"), where("raffleKey", "==", item?.raffleKey));
                        const querySnapshot = await getDocs(q);
                        querySnapshot.forEach((doc) => {
                            dbData = doc.data();
                            dbData.id = doc.id;
                        });
                        if (item.creator.toBase58() === wallet.publicKey?.toBase58())
                            profileList.push({
                                nftMint: item.nftMint.toBase58(),
                                raffleKey: item.raffleKey,
                                endTimestamp: item.endTimestamp.toNumber(),
                                createTimeStamp: dbData.createTimeStamp,
                                twitter: dbData.twitter,
                                ticketPriceSol: item.ticketPriceSol.toNumber() / LAMPORTS_PER_SOL,
                                id: dbData.id,
                                collectionName: dbData.collectionName,
                                collectionId: dbData.collectionId,
                            })
                        if (item.winner.toBase58() === wallet.publicKey?.toBase58())
                            wons.push({
                                nftMint: item.nftMint.toBase58(),
                                raffleKey: item.raffleKey,
                                endTimestamp: item.endTimestamp.toNumber(),
                                createTimeStamp: dbData.createTimeStamp,
                                twitter: dbData.twitter,
                                ticketPriceSol: item.ticketPriceSol.toNumber() / LAMPORTS_PER_SOL,
                                id: dbData.id,
                                collectionName: dbData.collectionName,
                                collectionId: dbData.collectionId,
                            })
                    }
                }
            }
            setCreatorProfile(profileList);
            setWonRaffles(wons);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getCreatorProfileData();
        // eslint-disable-next-line
    }, [raffleDetail, wallet.connected]);

    const profileCardShow = () => {
        props.showDetail();
    }

    return (
        <div className="raffle-detail">
            <div className="dark-overlay" style={{ opacity: showedDetail ? 1 : 0, pointerEvents: !showedDetail ? "none" : "all" }} onClick={() => handleShow()}></div>
            <div className="raffle-detail-content" style={{ transform: `translateX(${showedDetail ? "0" : "100%"})` }}>
                <div className="content-header">
                    <button className="icon-button btn-dark" onClick={() => handleShow()}>
                        <BackIcon />
                    </button>
                    <div className="detail-name">
                        <p><FingerPrintIcon />{wallet.publicKey?.toBase58().slice(0, 4)}..{wallet.publicKey?.toBase58().slice(-4)}</p>
                    </div>
                </div>
                <div className="profile-tab">
                    <button className={`tab ${tab === "mine" ? "active" : ""}`} onClick={() => setTab("mine")}>Your Raffles</button>
                    <button className={`tab ${tab === "won" ? "active" : ""}`} onClick={() => setTab("won")}>Won Raffles</button>
                </div>
                {tab === "mine" &&
                    (!isLoading ?
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
                                    keyword={""}
                                    headTab={""}
                                    collectionName={item.collectionName}
                                    collectionId={item.collectionId}
                                    pageLoading={props.pageLoading}
                                />
                            ))}
                        </div>
                        :
                        <div className="profile-content">
                            <div className="nft-card">
                                <NFTCardSkeleton />
                            </div>
                            <div className="nft-card">
                                <NFTCardSkeleton />
                            </div>
                        </div>)

                }
                {tab === "won" &&
                    (!isLoading ?
                        <div className="profile-content">
                            {wonRaffles && wonRaffles.length !== 0 && wonRaffles.map((item: any, key: number) => (
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
                                    keyword={""}
                                    headTab={""}
                                    collectionName={item.collectionName}
                                    collectionId={item.collectionId}
                                    pageLoading={props.pageLoading}
                                />
                            ))}
                        </div>
                        :
                        <div className="profile-content">
                            <div className="nft-card">
                                <NFTCardSkeleton />
                            </div>
                            <div className="nft-card">
                                <NFTCardSkeleton />
                            </div>
                        </div>)

                }
            </div>
        </div >
    )
}