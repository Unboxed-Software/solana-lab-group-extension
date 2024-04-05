import { initializeKeypair } from "@solana-developers/helpers";
import { Connection, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import { createMintForGroup } from "./create-mint";
dotenv.config();

(async () => {
  const connection = new Connection("http://localhost:8899", "confirmed");
  const payer = await initializeKeypair(connection);

  const mintKeypair = Keypair.generate();

  console.log(`public key: ${payer.publicKey.toBase58()}`);

  const signature = await createMintForGroup({
    connection,
    payer,
    mintKeypair,
    mintAuthority: payer.publicKey,
    maxMembers: 10,
  });

  console.log(
    `Check the transaction at: https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`,
  );
})();
