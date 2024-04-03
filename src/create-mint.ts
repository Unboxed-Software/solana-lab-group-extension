import {
	Cluster,
	sendAndConfirmTransaction,
	Connection,
	Keypair,
	SystemProgram,
	Transaction,
	TransactionSignature,
	PublicKey,
} from '@solana/web3.js'

import {
	ExtensionType,
	createInitializeMintInstruction,
	getMintLen,
	TOKEN_2022_PROGRAM_ID,
	createInitializeGroupInstruction,
	tokenGroupInitializeGroup,
	createInitializeGroupPointerInstruction,
	createUpdateGroupMaxSizeInstruction,
	createUpdateGroupAuthorityInstruction,
	createInitializeMemberInstruction,
} from '@solana/spl-token'

export async function createMintForGroup(
	cluster: Cluster,
	connection: Connection,
	payer: Keypair,
	mintKeypair: Keypair,
	mintAuthority: Keypair,
	updateAuthority: Keypair,
	freezeAuthority: Keypair,
	decimals: number,
	maxMembers: number
): Promise<TransactionSignature> {
	const extensions: any[] = [ExtensionType.TokenGroup]
	const mintLength = getMintLen(extensions)

	const mintLamports =
		await connection.getMinimumBalanceForRentExemption(mintLength)

	console.log('Creating a transaction with group instruction... ')

	const mintTransaction = new Transaction().add(
		SystemProgram.createAccount({
			fromPubkey: payer.publicKey,
			newAccountPubkey: mintKeypair.publicKey,
			space: mintLength,
			lamports: mintLamports,
			programId: TOKEN_2022_PROGRAM_ID,
		}),
		createInitializeMintInstruction(
			mintKeypair.publicKey,
			decimals,
			mintAuthority.publicKey,
			freezeAuthority.publicKey,
			TOKEN_2022_PROGRAM_ID
		)
	)

	console.log('Sending create mint transaction...')
	let signature = await sendAndConfirmTransaction(
		connection,
		mintTransaction,
		[payer, mintKeypair],
		{commitment: 'finalized'}
	)

	console.log(
		`Check the transaction at: https://explorer.solana.com/tx/${signature}?cluster=${cluster}`
	)

	const groupTransaction = new Transaction().add(
		createInitializeGroupInstruction({
			group: mintKeypair.publicKey,
			maxSize: maxMembers,
			mint: mintKeypair.publicKey,
			mintAuthority: mintAuthority.publicKey,
			programId: TOKEN_2022_PROGRAM_ID,
			updateAuthority: updateAuthority.publicKey,
		}),
		createUpdateGroupMaxSizeInstruction({
			group: mintKeypair.publicKey,
			maxSize: maxMembers,
			programId: TOKEN_2022_PROGRAM_ID,
			updateAuthority: updateAuthority.publicKey,
		}),
		createUpdateGroupAuthorityInstruction({
			currentAuthority: payer.publicKey,
			group: mintKeypair.publicKey,
			newAuthority: updateAuthority.publicKey,
			programId: TOKEN_2022_PROGRAM_ID,
		})
	)

	console.log('Sending group transaction...')
	signature = await sendAndConfirmTransaction(
		connection,
		groupTransaction,
		[mintAuthority, updateAuthority],
		{commitment: 'finalized'}
	)

	console.log(
		`Check the transaction at: https://explorer.solana.com/tx/${signature}?cluster=${cluster}`
	)

	return signature
}
