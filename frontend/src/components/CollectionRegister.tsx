import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useEffect, useState } from "react";
import { CloseIcon, VerifiedIcon } from "./svgIcons";
import { addDoc, getDocs } from "firebase/firestore";
import { collectionsInstance } from "../api/firebase";
import { infoAlert, successAlert, warningAlert } from "./toastGroup";

export default function CollectionRegister(props:
    {
        showRegister: boolean,
        closeRegister: Function,
        startLoading: Function,
        closeLoading: Function
    }) {
    const [collectionName, setCollectionName] = useState("");
    const [collectionId, setCollectionId] = useState("");
    const [marketplace, setMarketplace] = useState("");
    const [twitter, setTwitter] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [isAble, setIsAble] = useState(false);

    const handleCollectionName = (e: any) => {
        setCollectionName(e.target.value);
    }
    const handleCollectionId = (e: any) => {
        setCollectionId(e.target.value);
    }
    const handleMarketplace = (e: any) => {
        setMarketplace(e.target.value);
    }
    const handleTwitter = (e: any) => {
        setTwitter(e.target.value);
    }

    const handleIsOnwer = (e: any) => {
        setIsOwner(e.target.value);
    }

    const handleRegister = async () => {
        let registered = false;
        await getDocs(collectionsInstance)
            .then(async (data) => {
                const collections = (data.docs.map((item: any) => {
                    return ({ ...item.data(), id: item.id })
                }));
                for (let collection of collections) {
                    if (collection.collectionId === collectionId) {
                        registered = true;
                        if (!collection.accepted) {
                            warningAlert("You have already sent a registration request.");
                        } else {
                            infoAlert("This collection has already been accepted!");
                        }
                    }
                }
            }).catch((error) => {
                console.log(error)
            })
        if (!registered) {
            await addDoc(collectionsInstance, {
                collectionId: collectionId,
                collectionName: collectionName,
                marketplace: marketplace,
                twitter: twitter,
                isOwner: isOwner,
                createTimeStamp: new Date().getTime(),
                updateTimeStamp: new Date().getTime(),
                accepted: false,
                status: 0
            })
                .then(() => {
                    successAlert("A request to register of a collection has been sent!");
                    props.closeRegister();
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    }

    useEffect(() => {
        if (collectionName === "" &&
            collectionId === ""
        ) {
            setIsAble(false);
        } else {
            setIsAble(true);
        }
    }, [collectionName, collectionId, marketplace, twitter]);

    return (
        <div className="collection-register"
            style={{
                transform: props.showRegister ? "translateY(0)" : "translateY(100%)",
                // opacity: props.showRegister ? 1 : 0,
                height: props.showRegister ? "100vh" : 0,
                overflowY: props.showRegister ? "auto" : "hidden"
            }}>
            <div className="container">
                <div className="create-header">
                    <button className="icon-button" onClick={() => props.closeRegister()}>
                        <CloseIcon />
                    </button>
                </div>
            </div>
            <div className="register-content">
                <h1>Register Collection</h1>
                <p>New Submissions are required to have 10k SOL worth of Volume on secondary market. Allow for a 24 hour period to lapse before approval.</p>
                <div className="register-form">
                    <input
                        value={collectionName}
                        onChange={handleCollectionName}
                        placeholder="NFT name"
                        className="register-input"
                    />
                </div>
                <div className="register-form">
                    <input
                        value={collectionId}
                        onChange={handleCollectionId}
                        placeholder="Creator ID"
                        className="register-input"
                    />
                </div>
                <div className="register-form">
                    <input
                        value={marketplace}
                        onChange={handleMarketplace}
                        placeholder="Marketplace URL"
                        className="register-input"
                    />
                </div>
                <div className="register-form">
                    <input
                        value={twitter}
                        onChange={handleTwitter}
                        placeholder="Twitter URL"
                        className="register-input"
                    />
                </div>
                <div className="isowner-option">
                    <label>Are you the project owner?</label>
                    <FormControl>
                        <RadioGroup row value={isOwner} onChange={handleIsOnwer}>
                            <FormControlLabel value={true} control={<Radio />} label="Yes" />
                            <FormControlLabel value={false} control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>
                </div>
                <button
                    className="btn-register"
                    disabled={!isAble}
                    onClick={() => handleRegister()}
                >
                    <VerifiedIcon color="#001F25" />Register Collection
                </button>
            </div>
        </div>
    )
}
