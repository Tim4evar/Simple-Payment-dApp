import { freighter as freighterApi } from "@stellar/freighter-api";
import StellarSdk from "stellar-sdk";

export const freighter = freighterApi;

export async function getBalance(publicKey: string) {
  try {
    const server = new StellarSdk.Server("https://testnet.stellar.org");
    const account = await server.loadAccount(publicKey);
    const balances = account.balances;
    const xlmBalance = balances.find((b: any) => b.asset_type === "native");
    return xlmBalance ? xlmBalance.balance : "0";
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
}

export async function sendXlm(publicKey: string, destination: string, amount: string) {
  try {
    const server = new StellarSdk.Server("https://testnet.stellar.org");
    
    // Load the source account to get the current sequence number
    const sourceAccount = await server.loadAccount(publicKey);
    
    const transaction = new StellarSdk.TransactionBuilder(publicKey, {
      fee: StellarSdk.minFee,
      previousTime: sourceAccount.options.sequence,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset: StellarSdk.assets.native(),
          amount: amount,
        })
      )
      .setTimeout(30)
      .build();

    // Use Freighter to sign the transaction
    const signedTransaction = await freighter.signTransaction(transaction);
    
    // Submit the transaction to the network
    const result = await server.submitTransaction(signedTransaction);
    return result;
  } catch (error) {
    console.error("Error sending XLM:", error);
    throw error;
  }
}
