import {
	sendAndConfirmTransaction,
	Connection,
	Keypair,
	SystemProgram,
	Transaction,
	TransactionSignature,
} from "@solana/web3.js"

import {
	ExtensionType,
	createInitializeMintInstruction,
	getMintLen,
	TOKEN_2022_PROGRAM_ID,
	createInitializeGroupInstruction,
	createInitializeGroupPointerInstruction,
	TYPE_SIZE,
	LENGTH_SIZE,
	createInitializeMetadataPointerInstruction,
	TOKEN_GROUP_SIZE,
} from "@solana/spl-token"
import {
	TokenMetadata,
	createInitializeInstruction,
	pack,
} from "@solana/spl-token-metadata"

export async function createTokenExtensionMintWithGroupPointer(
	connection: Connection,
	payer: Keypair,
	mintKeypair: Keypair,
	decimals: number,
	maxMembers: number,
	metadata: TokenMetadata
): Promise<TransactionSignature> {
	const extensions: any[] = [
		ExtensionType.GroupPointer,
		ExtensionType.MetadataPointer,
	]

	const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length
	const mintLength = getMintLen(extensions)
	const totalLen = mintLength + metadataLen + TOKEN_GROUP_SIZE

	const mintLamports =
		await connection.getMinimumBalanceForRentExemption(totalLen)

	console.log("Creating a transaction with group instruction... ")

	const mintTransaction = new Transaction().add(
		SystemProgram.createAccount({
			fromPubkey: payer.publicKey,
			newAccountPubkey: mintKeypair.publicKey,
			space: mintLength,
			lamports: mintLamports,
			programId: TOKEN_2022_PROGRAM_ID,
		}),
		createInitializeGroupPointerInstruction(
			mintKeypair.publicKey,
			payer.publicKey,
			mintKeypair.publicKey,
			TOKEN_2022_PROGRAM_ID
		),
		createInitializeMetadataPointerInstruction(
			mintKeypair.publicKey,
			payer.publicKey,
			mintKeypair.publicKey,
			TOKEN_2022_PROGRAM_ID
		),
		createInitializeMintInstruction(
			mintKeypair.publicKey,
			decimals,
			payer.publicKey,
			payer.publicKey,
			TOKEN_2022_PROGRAM_ID
		),
		createInitializeGroupInstruction({
			group: mintKeypair.publicKey,
			maxSize: maxMembers,
			mint: mintKeypair.publicKey,
			mintAuthority: payer.publicKey,
			programId: TOKEN_2022_PROGRAM_ID,
			updateAuthority: payer.publicKey,
		}),
		createInitializeInstruction({
			metadata: mintKeypair.publicKey,
			mint: mintKeypair.publicKey,
			mintAuthority: payer.publicKey,
			name: metadata.name,
			programId: TOKEN_2022_PROGRAM_ID,
			symbol: metadata.symbol,
			updateAuthority: payer.publicKey,
			uri: metadata.uri,
		})
	)

	console.log("Sending create mint transaction...")
	let signature = await sendAndConfirmTransaction(
		connection,
		mintTransaction,
		[payer, mintKeypair],
		{commitment: "finalized"}
	)

	return signature
}
