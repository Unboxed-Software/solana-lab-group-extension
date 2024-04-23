import {initializeKeypair} from '@solana-developers/helpers'
import {
	Cluster,
	Connection,
	Keypair,
	LAMPORTS_PER_SOL,
	clusterApiUrl,
} from '@solana/web3.js'
import {uploadOffChainMetadata} from './helpers'
import {TokenMetadata} from '@solana/spl-token-metadata'
import dotenv from 'dotenv'
import {createGroup} from './create-mint'
dotenv.config()

const CLUSTER: Cluster = 'devnet'

/**
 * Create a connection and initialize a keypair if one doesn't already exists.
 * If a keypair exists, airdrop a sol if needed.
 */
const connection = new Connection('http://127.0.0.1:8899')

const payer = await initializeKeypair(connection)

const devnetKeypair = await initializeKeypair(connection, {
	keypairPath: '/home/aditya-kulkarni/.config/solana/id.json',
})

const balance = await connection.getBalance(payer.publicKey)

console.log(
	'Balance: ',
	balance / LAMPORTS_PER_SOL,
	payer.publicKey.toBase58(),
	devnetKeypair.publicKey.toBase58()
)

// DEFINE GROUP METADATA
const collectionMintKeypair = Keypair.generate()

const collectionMetadata = {
	imagePath: 'src/assets/collection.jpeg',
	tokenName: 'cool-cats-collection',
	tokenDescription: 'Collection of Cool Cat NFTs',
	tokenSymbol: 'MEOWs',
	tokenExternalUrl: 'https://solana.com/',
	tokenAdditionalMetadata: undefined,
	tokenUri: '',
	metadataFileName: 'collection.json',
}

collectionMetadata.tokenUri = await uploadOffChainMetadata(
	collectionMetadata,
	payer,
	devnetKeypair
)

const collectionTokenMetadata: TokenMetadata = {
	name: collectionMetadata.tokenName,
	mint: collectionMintKeypair.publicKey,
	symbol: collectionMetadata.tokenSymbol,
	uri: collectionMetadata.tokenUri,
	updateAuthority: payer.publicKey,
	additionalMetadata: Object.entries(
		collectionMetadata.tokenAdditionalMetadata || []
	).map(([trait_type, value]) => [trait_type, value]),
}

// CREATE GROUP MINT
const decimals = 0
const maxMembers = 3

const signature = await createGroup(
	connection,
	payer,
	collectionMintKeypair,
	decimals,
	maxMembers,
	collectionTokenMetadata
)

console.log(`Created collection mint with metadata. Signature: ${signature}`)
