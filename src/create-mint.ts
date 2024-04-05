import {
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionSignature,
  PublicKey,
} from "@solana/web3.js";
import {
  ExtensionType,
  createInitializeMintInstruction,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
  createInitializeGroupPointerInstruction,
} from "@solana/spl-token";
import {
  createInitializeGroupInstruction,
  TOKEN_GROUP_SIZE,
} from "@solana/spl-token-group";

export async function createMintForGroup({
  connection,
  payer,
  mintKeypair,
  mintAuthority,
  maxMembers,
}: {
  connection: Connection;
  payer: Keypair;
  mintKeypair: Keypair;
  mintAuthority: PublicKey;
  maxMembers: number;
}): Promise<TransactionSignature> {
  const mintLength = getMintLen([ExtensionType.GroupPointer]);

  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLength + TOKEN_GROUP_SIZE + 5, // remove this +5 will fail the init group instruction
  );
  console.log("length: ", mintLength + TOKEN_GROUP_SIZE);
  console.log("lamports: ", lamports);

  console.log("Creating a transaction with group instruction... ");

  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLength,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeGroupPointerInstruction(
      mintKeypair.publicKey,
      payer.publicKey,
      mintKeypair.publicKey,
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      0, // NFT should have 0 decimals
      mintAuthority,
      null,
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeGroupInstruction({
      mint: mintKeypair.publicKey,
      group: mintKeypair.publicKey,
      mintAuthority,
      maxSize: maxMembers,
      updateAuthority: payer.publicKey,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
  );

  console.log("Sending create mint transaction...");
  const signature = await sendAndConfirmTransaction(
    connection,
    mintTransaction,
    [payer, mintKeypair],
    { skipPreflight: true },
  );
  console.log(signature);
  return signature;
}
