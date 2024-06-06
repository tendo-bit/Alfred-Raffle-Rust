import { useEffect } from "react"
import { useRouter } from "next/router"
import { useWallet } from "@solana/wallet-adapter-react";
import { ADMINS } from "../../config";

export default function AdminPage() {
    const router = useRouter();
    const wallet = useWallet();
    useEffect(() => {
        if (wallet.publicKey !== null) {
            if (ADMINS.indexOf(wallet.publicKey.toBase58()) !== -1) {
                router.push("/admin/collection-management");
            } else {
                router.push("/")
            }
        } else {
            // router.push("/");
        }

        // eslint-disable-next-line
    }, [wallet.connected, wallet.publicKey])
    return (
        <div></div>
    )
}