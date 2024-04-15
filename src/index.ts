import {initializeKeypair} from '@solana-developers/helpers'
import {Cluster, Connection, clusterApiUrl} from '@solana/web3.js'
import dotenv from 'dotenv'
dotenv.config()

const CLUSTER: Cluster = 'devnet'

/**
 * Create a connection and initialize a keypair if one doesn't already exists.
 * If a keypair exists, airdrop a sol if needed.
 */
const connection = new Connection(clusterApiUrl(CLUSTER))

const payer = await initializeKeypair(connection, {
	keypairPath: 'path-to-solana-keypair',
})

// DEFINE GROUP METADATA

// CREATE GROUP MINT
