import {Connection, Keypair, LAMPORTS_PER_SOL} from '@solana/web3.js'
import Irys from '@irys/sdk'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

export interface CreateNFTInputs {
	payer: Keypair
	connection: Connection
	tokenName: string
	tokenSymbol: string
	tokenUri: string
	tokenAdditionalMetadata?: Record<string, string>
}

export interface UploadOffChainMetadataInputs {
	tokenName: string
	tokenSymbol: string
	tokenDescription: string
	tokenExternalUrl: string
	tokenAdditionalMetadata?: Record<string, string>
	imagePath: string
	metadataFileName: string
}

function formatIrysUrl(id: string) {
	return `https://gateway.irys.xyz/${id}`
}

const getIrysArweave = async (
	secretKey: Uint8Array,
	devnetSecretKey: Uint8Array
) => {
	const irys = new Irys({
		network: 'devnet',
		token: 'solana',
		key: devnetSecretKey,
		config: {
			providerUrl: 'https://api.devnet.solana.com',
		},
	})

	const balance = await irys.getBalance(irys.address as string)
	if (Number(irys.utils.toAtomic(balance)) < LAMPORTS_PER_SOL) {
		try {
			const fundTx = await irys.fund(irys.utils.toAtomic(1))
			console.log(
				`Successfully funded ${irys.utils.fromAtomic(fundTx.quantity)} ${irys.token}`
			)
		} catch (e) {
			console.log('Error uploading data ', e)
		}
	}
	return irys
}

export async function uploadOffChainMetadata(
	inputs: UploadOffChainMetadataInputs,
	payer: Keypair,
	devnetKeypair: Keypair
) {
	const {
		tokenName,
		tokenSymbol,
		tokenDescription,
		tokenExternalUrl,
		imagePath,
		tokenAdditionalMetadata,
		metadataFileName,
	} = inputs

	const irys = await getIrysArweave(payer.secretKey, devnetKeypair.secretKey)

	const imageUploadReceipt = await irys.uploadFile(imagePath)

	const metadata = {
		name: tokenName,
		symbol: tokenSymbol,
		description: tokenDescription,
		external_url: tokenExternalUrl,
		image: formatIrysUrl(imageUploadReceipt.id),
		attributes: Object.entries(tokenAdditionalMetadata || []).map(
			([trait_type, value]) => ({trait_type, value})
		),
	}

	const metadataFile = path.join(__dirname, `/assets/${metadataFileName}`)

	fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 4), {
		flag: 'w',
	})

	const metadataUploadReceipt = await irys.uploadFile(metadataFile)

	return formatIrysUrl(metadataUploadReceipt.id)
}
