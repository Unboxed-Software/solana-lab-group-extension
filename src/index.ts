import {initializeKeypair} from '@solana-developers/helpers'
import {
	Cluster,
	Connection,
	clusterApiUrl,
	Keypair,
	LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import dotenv from 'dotenv'
import {createMintForGroup} from './create-mint'
import {
	TOKEN_2022_PROGRAM_ID,
	createAccount,
	createMint,
	tokenGroupInitializeGroup,
	tokenGroupInitializeGroupWithRentTransfer,
} from '@solana/spl-token'
import {min} from 'bn.js'
dotenv.config()

const CLUSTER: Cluster = 'devnet'

async function main() {
	/**
	 * Create a connection and initialize a keypair if one doesn't already exists.
	 * If a keypair exists, airdrop a sol if needed.
	 */
	const connection = new Connection(clusterApiUrl(CLUSTER))
	const payer = await initializeKeypair(connection, {
		envFileName: '.env',
		envVariableName: 'PRIVATE_KEY',
	})

	const mintAuthority = Keypair.generate()
	const freezeAuthority = Keypair.generate()
	const updateAuthority = Keypair.generate()

	console.log(`public key: ${payer.publicKey.toBase58()}`)

	// const balance = await connection.getBalance(payer.publicKey)
	// console.log('Balance: ', balance / LAMPORTS_PER_SOL)

	const decimals = 9
	const mintKeypair = Keypair.generate()
	let mint = mintKeypair.publicKey
	console.log(
		'\nmint public key: ' + mintKeypair.publicKey.toBase58() + '\n\n'
	)

	const maxMembers = 1

	createMintForGroup(
		CLUSTER,
		connection,
		payer,
		mintKeypair,
		mintAuthority,
		updateAuthority,
		freezeAuthority,
		decimals,
		maxMembers
	)
}

main()
