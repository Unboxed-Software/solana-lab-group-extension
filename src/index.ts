import {initializeKeypair, makeKeypairs} from '@solana-developers/helpers'
import {Cluster, Connection, clusterApiUrl} from '@solana/web3.js'
import dotenv from 'dotenv'
import {createGroup} from './create-mint'
import {TokenMetadata} from '@solana/spl-token-metadata'
import {uploadOffChainMetadata} from './helpers'

dotenv.config()

const CLUSTER: Cluster = 'devnet'

/**
 * Create a connection and initialize a keypair if one doesn't already exists.
 * If a keypair exists, airdrop a sol if needed.
 */
const connection = new Connection(clusterApiUrl(CLUSTER))

const payer = await initializeKeypair(connection, {
	keypairPath: '/home/aditya-kulkarni/.config/solana/id.json',
})

console.log(
	`public key: ${payer.publicKey.toBase58()}`,
	await connection.getBalance(payer.publicKey)
)

const [collectionMintKeypair] = makeKeypairs(1)

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
	payer
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
