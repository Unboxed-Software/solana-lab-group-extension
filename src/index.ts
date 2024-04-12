import {initializeKeypair} from '@solana-developers/helpers'
import {Cluster, Connection} from '@solana/web3.js'
import dotenv from 'dotenv'
dotenv.config()

const CLUSTER: Cluster = 'devnet'

/**
 * Create a connection and initialize a keypair if one doesn't already exists.
 * If a keypair exists, airdrop a sol if needed.
 */
const connection = new Connection('http://127.0.0.1:8899')

const payer = await initializeKeypair(connection)

// CREATE GROUP MINT WITH METADATA
