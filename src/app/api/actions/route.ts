import {
    ActionPostResponse,
    createPostResponse,
    MEMO_PROGRAM_ID,
    ActionGetResponse,
    ActionPostRequest,
  } from "@solana/actions";
  import {
    clusterApiUrl,
    ComputeBudgetProgram,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
  } from "@solana/web3.js";
import { redirect } from "next/dist/server/api-utils/index.js";
  
  
  const ACTIONS_CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  const paymentStatus = {
    hasPaid: false
  };
  export async function GET(req: Request, res: Response) {
    

    const payload: ActionGetResponse = paymentStatus.hasPaid ? {
      title: "Java Documentation",
      icon: new URL("/java2.jpg", new URL(req.url).origin).toString(),
      description: "Java Fundamentals PDF",
      label:  "click to download",
      
    } : {
      title: "BlinkEd: Java Fundamentals PDF",
      icon: new URL("/java2.jpg", new URL(req.url).origin).toString(),
      description: "Purchase file/document",
      label: "Buy for 0.1 SOL",
    };
  
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  }
  export async function POST(req: Request) {
    try {
      if (paymentStatus.hasPaid) {
        const encodedURL = "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL3VjP2V4cG9ydD1kb3dubG9hZCZpZD0xNGRqQkRrak5xSVh0RlhIVGtuWi1TQjY0TXRUY0kxS0s=";
        //const decodedURL = atob(encodedURL);
      
        return new Response(JSON.stringify({ redirect: encodedURL }), {
          headers: ACTIONS_CORS_HEADERS,
        });
      }
      
          
      const body: ActionPostRequest = await req.json();
      console.log("Request body:", body);
      const account = new PublicKey(body.account);
      console.log("Account:", account.toString());
      const amount = 0.00001 * LAMPORTS_PER_SOL;
      console.log("Amount (lamports):", amount);
  
      const connection = new Connection(clusterApiUrl("devnet"));
      const ix = SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: new PublicKey('3x1neqaSTUUkdhpXXHGXyexxp6mEvojqvFZWaohVqQ9z'),
        lamports: amount,
      });
  
      const tx = new Transaction();
      tx.add(ix);
      tx.feePayer = account;
      
      const { blockhash } = await connection.getLatestBlockhash({ commitment: "finalized" });
      tx.recentBlockhash = blockhash;
      console.log("Recent blockhash:", blockhash);
  
      const serializedTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64");
      console.log("Serialized transaction:", serializedTx);
  
      // Update payment status to true
      paymentStatus.hasPaid = true;
  
      const payload: ActionPostResponse = {
        transaction: serializedTx,
        message: "It work!! thanks Check SOLANA EXPLORER" + account.toString(),
      };
  
      return new Response(JSON.stringify(payload), {
        headers: ACTIONS_CORS_HEADERS,
      });
  
    } catch (error) {
      console.error("Error processing payment:", error);
      return new Response(JSON.stringify({ error: "Payment processing failed" }), {
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  }
  export async function OPTIONS(req: Request) {
    return new Response(null, {
      headers: ACTIONS_CORS_HEADERS,
    });
  }
  