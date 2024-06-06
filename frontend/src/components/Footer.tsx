import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AddIcon, BottomPatterLeft, BottomPatterRight, DocIcon, FooterLogo, FooterMenuCloseIcon, FooterMenuIcon, FooterMobileLogo, UserIcon } from "./svgIcons";

export default function Footer(props: {
    showCreate: Function,
    showProfile: Function,
}) {
    const wallet = useWallet();
    const [showMenu, setShowMenu] = useState(false);

    const handleClick = (setFunction: Function) => {
        setShowMenu(false);
        setFunction();
    }

    return (
        <div className="footer">
            <div className="patters">
                <div className="pattern-left">
                    <BottomPatterLeft />
                </div>
                <div className="pattern-right">
                    <BottomPatterRight />
                </div>
            </div>
            <div className="container">
                <div className="footer-conetent">
                    <div className="footer-left">
                        <FooterLogo />
                    </div>
                    <div className="footer-center">
                        {wallet.publicKey === null ?
                            <button className="icon-button">
                                <UserIcon />
                            </button>
                            :
                            <button className="icon-button" onClick={() => props.showProfile()}>
                                <UserIcon />
                            </button>
                        }
                        <WalletModalProvider>
                            <WalletMultiButton />
                        </WalletModalProvider>
                        <button className="icon-button" style={{ marginLeft: 4 }}>
                            <DocIcon />
                        </button>
                    </div>
                    <div className="footer-right">
                        <button
                            className="create-raffle"
                            disabled={wallet.publicKey === null}
                            onClick={() => props.showCreate()}
                        >
                            <AddIcon /> Create Raffle
                        </button>
                    </div>
                </div>
            </div>
            <div className="mobile-footer">
                <FooterMobileLogo />
                <button className="btn-footer-menu" onClick={() => setShowMenu(true)}>
                    <FooterMenuIcon />
                </button>
            </div>
            <div
                className="footer-menu"
                style={{
                    height: showMenu ? "100vh" : 0
                }}
            >
                <div className="footer-menu-content">
                    <div className="menu-header">
                        <p>Menu</p>
                        <button className="btn-footer-close" onClick={() => setShowMenu(false)}>
                            <FooterMenuCloseIcon />
                        </button>

                    </div>
                    <div className="footer-buttons">
                        <button className="btn-user" onClick={() => handleClick(() => props.showProfile())}>
                            <UserIcon />
                            <span>Profile</span>
                        </button>

                        <WalletModalProvider>
                            <WalletMultiButton />
                        </WalletModalProvider>
                    </div>
                </div>
                <button
                    className="footer-create"
                    onClick={() => handleClick(() => props.showCreate())}
                    disabled={wallet.publicKey === null}>
                    <AddIcon color="#fff" /> Create Raffle
                </button>
            </div>
        </div >
    )
}
