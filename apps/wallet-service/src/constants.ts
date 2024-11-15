import { join } from "path"

// constant21
export const walletGrpcConstants = {
    NAME: "WALLET_PACKAGE",
    SERVICE: "WalletService",
    PACKAGE: "wallet",
    PROTO_PATH: join(process.cwd(), "proto", "wallet/wallet.proto")
}
