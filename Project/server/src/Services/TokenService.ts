import { ethers } from "ethers";
import carbonCreditAbi from "../contracts/carbonCreditAbi.json";
import { DebtsDAO } from "../DAO/DebtsDAO";
import { UserWalletDAO } from "../DAO/UserWalletDAO";
import { UserWallet } from "../Models/UserWallet";

// Provider su Besu (come in hardhat.config)
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Stesso indirizzo del contratto usato da Hardhat
const TOKEN_ADDRESS = "0x2E6A0e0106F37A045a8b0B9C9357Ffe9a873Fa4c";

// Account di test (puoi anche importarli da .env se vuoi)
const Account1 = "0xc73aF3677eBc555Fc631d3EdfCE675A656b684e5";
const Account1_private_key = "7a18769fc1e450f623619bb54b67e118a2462ae5f8f4be8f066de5a77cfc3cf1";

const Account2="0x9c895B655b7340615b953bA7E777455B78550DF6";
const Account2_private_key="356fd7201a910f2bde48d0037f06d337dce0bf00014fa3f74114301f4396e6df";

const debtsDAO = new DebtsDAO();
const userWalletDAO = new UserWalletDAO();

export async function checkBalances(account: string, userId: number): Promise<number> {
  const token = new ethers.Contract(TOKEN_ADDRESS, carbonCreditAbi, provider);

  try {
    const ethBalance = await provider.getBalance(account);
    const tokenBalance = await token.balanceOf(account);
    const balance = ethers.formatEther(tokenBalance)
    console.log(`🌿 CO2: ${tokenBalance}`);
    const userWallet = new UserWallet (
      userId,
      parseInt(balance),
      account,
    )

    await userWalletDAO.update( userWallet );


    console.log(`📬 Address: ${account}`);
    console.log(`💰 ETH: ${ethers.formatEther(ethBalance)}`);
    console.log(`🌿 CO2: ${balance}`);
    console.log(` ` )
    console.log("───────────────────────────────");
    return parseInt(balance)
  } catch (err) {
    console.error(`❌ Errore con ${account}:`, err);
    return 0;
  }
  
  const block = await provider.getBlockNumber();
  console.log(`📦 Ultimo blocco: ${block}`);
  return 0;
}

/*export async function transferCarbonCredits(amountInEther: string, sender: string, receiver: string) {
  //Qui poi andrà l'account del mittente (sender), ma per ora usiamo Account1
  const wallet = new ethers.Wallet(Account1_private_key, provider);
  const token = new ethers.Contract(TOKEN_ADDRESS, carbonCreditAbi, wallet);

  try {
    // 👇 Converti input a BigInt
    const amount = ethers.parseEther(amountInEther); // BigInt

    // 👇 Recupera il debito del destinatario (placeholder, simula con 100)
    const debito = ethers.parseEther("100"); // BigInt

    if (debito > 0) {
      if (amount > debito) {
        const amountToSend = amount - debito;

        const burnTx = await token.burn(debito); // ✅ usa direttamente debito
        console.log(`🔥 Bruciando ${ethers.formatEther(debito)} token per coprire il debito...`);
        await burnTx.wait();
        console.log(`✅ Debito di ${ethers.formatEther(debito)} token bruciato.`);

        const tx = await token.transfer(account2, amountToSend);
        console.log("⏳ Transazione inviata. In attesa di conferma...");
        await tx.wait();
        console.log(`✅ ${ethers.formatEther(amountToSend)} CO2 inviati a ${account2}`);
        console.log(`🔗 Hash transazione: ${tx.hash}`);

        // await updateDebito(account2, 0); // placeholder
      } else {
        const nuovoDebito = debito - amount;
        // await updateDebito(account2, nuovoDebito); // placeholder
        console.log(`ℹ️ Importo insufficiente, debito aggiornato a ${ethers.formatEther(nuovoDebito)} CO2`);
      }
    } else {
      const tx = await token.transfer(account2, amount);
      console.log("⏳ Transazione inviata. In attesa di conferma...");
      await tx.wait();
      console.log(`✅ ${ethers.formatEther(amount)} CO2 inviati a ${account2}`);
      console.log(`🔗 Hash transazione: ${tx.hash}`);
    }
  } catch (err) {
    console.error("❌ Errore durante il trasferimento:", err);
  }
}*/

// Funzione per mintare i carbon credits, se ho debito minto solo la differenza tra l'importo richiesto 
// e il debito corrente, aggiornando il debito dell'utente
export async function mintCarbonCredits(idReceiver: number, receiver: string, amountInEther: number): Promise<number> {
  //Recupero il debito dell'utente
  const currentDebts = await debtsDAO.findByUserId(idReceiver);

  // Calcolo l'importo da mintare come differenza tra l'importo richiesto e il debito corrente
  const amountToMint = amountInEther - currentDebts;

  // Se i token guadagnati non superano il debito, non minto nulla e aggiorno il debito
  if (amountToMint <= 0) {
    debtsDAO.update(idReceiver, currentDebts - amountInEther);
    console.log(`🔥 Bruciati ${Math.abs(amountInEther)} CO2 perchè ${receiver} in debito`);
  }
  else {
    // Se l'utente aveva un debito, lo azzero e minto i token
    if(currentDebts > 0) {
      debtsDAO.update(idReceiver, 0);
      console.log(`🔥 Bruciati ${currentDebts} CO2 perchè ${receiver} in debito`);
    }

    const wallet = new ethers.Wallet(Account1_private_key, provider); // deve essere l'owner
    const token = new ethers.Contract(TOKEN_ADDRESS, carbonCreditAbi, wallet);

    try {
      const amount = ethers.parseEther(amountToMint.toString()); // BigInt
      const tx = await token.mint(receiver, amount);
      console.log(`⛏️ Minting ${amount} CO2 per ${receiver}...`);
      await tx.wait();
      console.log(`✅ Mint completato. TX Hash: ${tx.hash}`);
    } 
    catch (err) {
      console.error("❌ Errore nel mint:", err);
    }
  }

  // Ritorna a prescindere l'importo di carbon credit associato all'emissione
  return amountInEther;
}

export async function removeCarbonCredits(userId: number, address: string, amountInEther: number): Promise<number> {
  /*const wallet = new ethers.Wallet(Account1_private_key, provider);
  const token = new ethers.Contract(TOKEN_ADDRESS, carbonCreditAbi, wallet);

  try {
    const amount = ethers.parseEther(amountInEther); // BigInt
    const tx = await token.burn(amount);
    console.log(`🔥 Bruciando ${amountInEther} CO2 da ${account}...`);
    await tx.wait();
    console.log(`✅ Burn completato. TX Hash: ${tx.hash}`);
  } catch (err) {
    console.error("❌ Errore durante il burn:", err);
  }*/

  return amountInEther;
}

/* async function main() {
  await checkBalances(Account1);
  //await checkBalances(Account2); 
  //await transferCarbonCredits("200", Account1, Account2);
  await mintCarbonCredits(Account1,"200");
 // await checkBalances(Account2); 
  await checkBalances(Account1);
  
}
// Esegui
main(); */