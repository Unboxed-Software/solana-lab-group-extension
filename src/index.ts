import {airdropIfRequired, initializeKeypair} from '@solana-developers/helpers'
import {
	Cluster,
	Connection,
	clusterApiUrl,
	Keypair,
	LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import dotenv from 'dotenv'
import {createMintForGroup} from './create-mint'
import {TOKEN_2022_PROGRAM_ID, getTokenMetadata} from '@solana/spl-token'
import {TokenMetadata} from '@solana/spl-token-metadata'
import {uploadOffChainMetadata} from './helpers'
dotenv.config()

const CLUSTER: Cluster = 'devnet'

async function main() {
	/**
	 * Create a connection and initialize a keypair if one doesn't already exists.
	 * If a keypair exists, airdrop a sol if needed.
	 */
	const connection = new Connection('http://127.0.0.1:8899')
	//const connection = new Connection(clusterApiUrl(CLUSTER))
	const payer = await initializeKeypair(connection, {
		envFileName: '.env',
		envVariableName: 'PRIVATE_KEY',
		minimumBalance: 10,
		airdropAmount: 10,
	})

	const balance = await connection.getBalance(payer.publicKey, {
		commitment: 'finalized',
	})

	console.log('Balance: ' + balance / LAMPORTS_PER_SOL)

	const updateAuthority = Keypair.generate()

	console.log(`public key: ${payer.publicKey.toBase58()}`)

	const decimals = 9
	const maxMembers = 3

	const mintKeypair = Keypair.generate()
	let mint = mintKeypair.publicKey
	console.log(
		'\nmint public key: ' + mintKeypair.publicKey.toBase58() + '\n\n'
	)

	const metadata: TokenMetadata = {
		name: 'cool-cats',
		updateAuthority: updateAuthority.publicKey,
		mint,
		symbol: 'MEOW',
		uri: 'https://solana.com/',
		additionalMetadata: [
			['species', 'Cat'],
			['breed', 'Cool'],
		],
	}

	await createMintForGroup(
		CLUSTER,
		connection,
		payer,
		mintKeypair,
		decimals,
		maxMembers,
		metadata
	)

	const data = await getTokenMetadata(
		connection,
		mint,
		'finalized',
		TOKEN_2022_PROGRAM_ID
	)

	console.log('metadata: ', data)
}

main()
