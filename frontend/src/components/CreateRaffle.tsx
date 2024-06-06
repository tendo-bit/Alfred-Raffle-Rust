import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { HashLoader } from "react-spinners";
import { collectionsInstance, db } from "../api/firebase";
import { createRaffle } from "../contexts/transaction";
import { getNftMetaData, solConnection } from "../contexts/utils";
import CreateCard from "./CreateCard";
import CreateCardSkeleton from "./CreateCardSkeleton";
import CustomDatePicker from "./CustomDatePicker";
import CustomTimePicker from "./CustomTimePicker";
import { CalandarIcon, CloseIcon, SolanaIcon, TicketIcon, TimeIcon, TwitterIcon, VerifiedIcon } from "./svgIcons";
import moment from "moment";
import { errorAlert } from "./toastGroup";

export default function CreateRaffle(props: {
    showCreated: boolean,
    closeCreate: Function,
    showRegistered: boolean,
    showRegister: Function,
    closeRegister: Function,
    startLoading: Function,
    closeLoading: Function,
    getAllData: Function,
    pageLoading: boolean
}) {
    const wallet = useWallet();
    const { startLoading, closeLoading } = props;
    const [termAccepted, setTermAccepted] = useState(false);
    const [nfts, setNfts] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState<string | undefined>();
    const [time, setTime] = useState<string | undefined>();
    const [ticketSupply, setticketSupply] = useState<number | undefined>();
    const [ticketPrice, setTicketPrice] = useState<number | undefined>();
    const [createAble, setCreateAble] = useState(false);
    const [twitter, setTwitter] = useState<string>("");

    const getWalletNFts = async () => {
        if (wallet.publicKey) {
            setIsLoading(true);
            let restered: any = [];
            let collectionNames: any = [];
            let collectionIds: any = [];
            let filterdNfts = [];
            await getDocs(collectionsInstance)
                .then(async (data) => {
                    const collections = (data.docs.map((item: any) => {
                        return ({ ...item.data(), id: item.id })
                    }));
                    for (let collection of collections) {
                        if (collection.accepted) {
                            restered.push(collection.collectionId);
                            collectionNames.push(collection.collectionName);
                            collectionIds.push(collection.collectionId);
                        }
                    }
                }).catch((error) => {
                    console.log(error)
                })

            const nftList = await getParsedNftAccountsByOwner({ publicAddress: wallet.publicKey.toBase58(), connection: solConnection });
            if (nftList.length !== 0) {
                let uriPromise: any = []
                for (let item of nftList) {
                    const uri = getNftMetaData(new PublicKey(item.mint));
                    uriPromise.push(uri);
                }
                const uriList = await Promise.all(uriPromise);
                let mataPrimise: any = [];
                for (let i = 0; i < uriList.length; i++) {
                    const metadata = fetch(uriList[i])
                        .then(resp =>
                            resp.json()
                        )
                        .catch((error) => {
                            console.log(error)
                        })
                        .then((json) => {
                            return json;
                        })
                    mataPrimise.push(metadata);
                }
                const metaList = await Promise.all(mataPrimise);
                for (let i = 0; i < metaList.length; i++) {
                    if (metaList[i]) {
                        if (restered.indexOf(nftList[i].data.creators[0].address) !== -1) {
                            filterdNfts.push({
                                description: metaList[i].description,
                                external_url: metaList[i].external_url,
                                image: metaList[i].image,
                                name: metaList[i].name,
                                mint: nftList[i].mint,
                                collectionName: collectionNames[collectionIds.indexOf(nftList[i].data.creators[0].address)],
                                collectionId: collectionIds[collectionIds.indexOf(nftList[i].data.creators[0].address)]
                            })
                        }
                    }
                }
            }
            setNfts(filterdNfts)
            setIsLoading(false);
        }
    }
    const [selectedNfts, setSelectedNfts] = useState<{
        mint: string,
        collectionName: string,
        collectionId: string
    }[]>([]);

    const handleSelect = (nft: { mint: string, selected: boolean, collectionName: string, collectionId: string }) => {
        let nftselected = selectedNfts;
        if (nftselected && nftselected.length !== 0) {
            let index = -1;
            for (let i = 0; i < nftselected.length; i++) {
                if (nftselected[i].mint === nft.mint) {
                    index = i;
                }
            }

            if (index !== -1) {
                nftselected.splice(index, 1);
            } else {
                nftselected.push({
                    mint: nft.mint,
                    collectionName: nft.collectionName,
                    collectionId: nft.collectionId
                });
            }
        } else {
            nftselected.push({
                mint: nft.mint,
                collectionName: nft.collectionName,
                collectionId: nft.collectionId
            }
            );
        }
        nftselected.sort((a: any, b: any) => b.name - a.name);
        setSelectedNfts(nftselected);
    }

    const handleTerm = (e: any) => {
        setTermAccepted(true)
    }

    const updatePage = () => {
        setSelectedNfts([]);
        getWalletNFts();
        props.closeCreate();
        props.getAllData();

    }

    const handleCreate = async () => {
        if (!(ticketPrice && ticketSupply)) return;
        if (moment(`${date}  ${time}`) < moment().add(1, 'days')) {
            errorAlert("The raffle should run for a minimum of 24 hours. Please select the date and time again.");
            return;
        }
        try {
            await createRaffle(
                wallet,
                selectedNfts,
                ticketPrice,
                new Date(`${date}  ${time}`).getTime() / 1000,
                ticketSupply,
                () => startLoading(),
                () => closeLoading(),
                () => updatePage(),
                twitter
            );
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (date && time && ticketPrice && ticketPrice !== 0 && ticketSupply && ticketSupply !== 0 && termAccepted && selectedNfts && selectedNfts.length !== 0) {
            setCreateAble(true);
        } else {
            setCreateAble(false);
        }
    }, [date, time, ticketSupply, ticketPrice, termAccepted, selectedNfts]);

    useEffect(() => {
        if (wallet.publicKey) {
            const collectionRefRaffles = collection(db, "raffles");
            const qRaffles = query(collectionRefRaffles);
            onSnapshot(qRaffles, () => {
                getWalletNFts();
            });
        }
        // eslint-disable-next-line
    }, [wallet.connected])

    return (
        <div
            className="create-raffle-component"
            style={{
                transform: props.showCreated ? "translateY(0)" : "translateY(100%)",
                // opacity: props.showCreated ? 1 : 0,
                height: props.showCreated ? "100vh" : 0,
                overflowY: props.showCreated ? "auto" : "hidden"
            }}>
            <div className="page-container">
                <div className="create-raffle-component-main">
                    <div className="create-header">
                        <button className="icon-button" onClick={() => props.closeCreate()}>
                            <CloseIcon />
                        </button>
                    </div>
                    <h2>Create your Raffle</h2>
                    <div className="create-main">
                        <div className="create-content">
                            <div className="values-group">
                                <div className="form-control">
                                    <CustomDatePicker
                                        onChange={(e: any) => setDate(e)}
                                    />
                                    <CalandarIcon />
                                </div>
                                <div className="form-control">
                                    <CustomTimePicker
                                        onChange={(e: any) => setTime(e)}
                                    />
                                    <TimeIcon />
                                </div>

                                <div className="form-control">
                                    <input
                                        value={ticketSupply}
                                        onChange={(e: any) => setticketSupply(e.target.value)}
                                        placeholder="Ticket Supply"
                                    />
                                    <TicketIcon />
                                </div>
                                <div className="form-control">
                                    <input
                                        value={ticketPrice}
                                        onChange={(e: any) => setTicketPrice(e.target.value)}
                                        placeholder="Ticket Price"
                                    />
                                    <SolanaIcon color="#fff" />
                                </div>
                                <div className="form-control">
                                    <input
                                        value={twitter}
                                        onChange={(e: any) => setTwitter(e.target.value)}
                                        placeholder="Twitter URL"
                                    />
                                    <TwitterIcon color="#fff" />
                                </div>
                            </div>
                            {/* <div className="price-twitter">
                                <p className="default-price">0.11 <SolanaIcon color="#fff" /></p>
                                <button className="add-twitter">
                                    <TwitterIcon color="#001F25" />
                                    Add Twitter for improved visibility
                                </button>
                            </div> */}
                            <FormControl>
                                <RadioGroup onChange={handleTerm}>
                                    <FormControlLabel value={termAccepted} control={<Radio checked={termAccepted} />} label="I accept the terms &#38; conditions below." />
                                </RadioGroup>
                            </FormControl>
                            <button
                                className={`btn-big ${props.pageLoading && "display-center"}`}
                                onClick={() => handleCreate()}
                                disabled={!createAble || props.pageLoading}
                            >
                                {!props.pageLoading ?
                                    <span>create raffle</span>
                                    :
                                    <><HashLoader color={"#000"} size={18} /><span style={{ marginLeft: 5, color: "#000" }}>creating...</span></>
                                }
                            </button>
                            <div className="create-terms">
                                <h5>Terms &#38; Conditions</h5>
                                <p>When you create a raffle, the NFT prize you have chosen will be transferred from your wallet into our escrow.</p>
                                <p>An up-front rent fee, charged in SOL will be taken in proportion to number of tickets. This will be auto refunded after the raffle concludes.</p>
                                <p>Raffles will proceed regardless if all tickets are sold or not. The creator can end the raffle after the specified date and time.</p>
                                <p>The raffle should run for a minimum of 24 hours.</p>
                                <p>Super Potato will take a 5% commission fee from the ticket sales.</p>
                                <p>Your NFT will be returned if there&#38;s no ticket sales.</p>
                                <p>Raffles CANNOT be edited or cancelled once a ticket is sold. Super Potato does not take responsibility for promoting or marketing the raffles.</p>
                            </div>
                        </div>
                        <div className="nft-mini-box">
                            <div className="nft-box-header">
                                <h4>Select NFTs for Raffle</h4>
                                <div className="follow-verify">
                                    <p>Collection not registered?</p>
                                    <button onClick={() => props.showRegister()}>
                                        <VerifiedIcon color="#001F25" />
                                        Register Collection
                                    </button>
                                </div>
                            </div>
                            <div className="createable-nfts">
                                {isLoading ?
                                    <>
                                        <CreateCardSkeleton />
                                        <CreateCardSkeleton />
                                        <CreateCardSkeleton />
                                        <CreateCardSkeleton />
                                        <CreateCardSkeleton />
                                        <CreateCardSkeleton />
                                        <CreateCardSkeleton />
                                        <CreateCardSkeleton />
                                    </>
                                    :
                                    <>
                                        {nfts && nfts.length !== 0 && nfts.map((item: any, key: number) => (
                                            <CreateCard
                                                key={key}
                                                selected={false}
                                                description={item.description}
                                                external_url={item.external_url}
                                                image={item.image}
                                                name={item.name}
                                                mint={item.mint}
                                                handleSelect={(e: any) => handleSelect(e)}
                                                collectionName={item.collectionName}
                                                collectionId={item.collectionId}
                                            />
                                        ))}
                                    </>
                                }
                            </div>

                            <div className="create-terms">
                                <h5>Terms &#38; Conditions</h5>
                                <p>When you create a raffle, the NFT prize you have chosen will be transferred from your wallet into our escrow.</p>
                                <p>An up-front rent fee, charged in SOL will be taken in proportion to number of tickets. This will be auto refunded after the raffle concludes.</p>
                                <p>Raffles will proceed regardless if all tickets are sold or not. The creator can end the raffle after the specified date and time.</p>
                                <p>The raffle should run for a minimum of 24 hours.</p>
                                <p>Super Potato will take a 5% commission fee from the ticket sales.</p>
                                <p>Your NFT will be returned if there&#38;s no ticket sales.</p>
                                <p>Raffles CANNOT be edited or cancelled once a ticket is sold. Super Potato does not take responsibility for promoting or marketing the raffles.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
