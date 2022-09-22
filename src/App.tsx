import {useEffect, useState} from 'react'
import {Web3Auth} from '@web3auth/web3auth'
import {OpenloginAdapter} from '@web3auth/openlogin-adapter'
import {CHAIN_NAMESPACES, SafeEventEmitterProvider} from '@web3auth/base'
import {SolanaPrivateKeyProvider, SolanaWallet} from '@web3auth/solana-provider'
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import './App.css'
import React from 'react'

const clientId =
  process.env.REACT_APP_CLIENT_ID ||
  'BBP_6GOu3EJGGws9yd8wY_xFT0jZIWmiLMpqrEMx36jlM61K9XRnNLnnvEtGpF-RhXJDGMJjL-I-wTi13RcBBOo' // get the clientId from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null)
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null,
  )

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.SOLANA,
            chainId: '0x3', // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
            rpcTarget: 'https://api.devnet.solana.com',
            displayName: 'Solana Devnet',
            blockExplorer: 'https://explorer.solana.com/?cluster=devnet',
            ticker: 'SOL',
            tickerName: 'Solana Token',
          },
        })

        setWeb3auth(web3auth)

        await web3auth.initModal()
        if (web3auth.provider) {
          setProvider(web3auth.provider)
        }
      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [])

  const login = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    const web3authProvider = await web3auth.connect()
    setProvider(web3authProvider)
  }

  const fetchPrivateKey = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    const privateKey = await web3auth?.provider?.request({
      method: 'solanaPrivateKey',
    })
    uiConsole(privateKey)
  }

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    const user = await web3auth.getUserInfo()
    uiConsole(user)
  }

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    const idToken = await web3auth.authenticateUser()
    uiConsole(idToken)
  }

  const parseToken = async () => {
    const idToken = await web3auth?.authenticateUser()
    console.log(idToken?.idToken)
    const base64Url = idToken?.idToken.split('.')[1]
    const base64 = base64Url?.replace('-', '+').replace('_', '/')
    const result = JSON.parse(window.atob(base64 as string))
    uiConsole(result)
  }

  const logout = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    await web3auth.logout()
    setProvider(null)
  }

  const getAccounts = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const solanaWallet = new SolanaWallet(provider)
    // Get user's Solana public address
    const accounts = await solanaWallet.requestAccounts()
    uiConsole(accounts)
  }

  const getBalance = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const solanaWallet = new SolanaWallet(provider)
    // Get user's Solana public address
    const accounts = await solanaWallet.requestAccounts()

    const connectionConfig: any = await solanaWallet.request({
      method: 'solana_provider_config',
      params: [],
    })

    const connection = new Connection(connectionConfig.rpcTarget)

    // Fetch the balance for the specified public key
    const balance = await connection.getBalance(new PublicKey(accounts[0]))
    uiConsole(balance / 1000000000)
  }

  const signaTransaction = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const solanaWallet = new SolanaWallet(provider)
    const connectionConfig: any = await solanaWallet.request({
      method: 'solana_provider_config',
      params: [],
    })

    const connection = new Connection(connectionConfig.rpcTarget)

    const accounts = await solanaWallet.requestAccounts()
    const blockhash = (await connection.getRecentBlockhash('finalized'))
      .blockhash
    const TransactionInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(accounts[0]),
      toPubkey: new PublicKey(accounts[0]),
      lamports: 0.01 * LAMPORTS_PER_SOL,
    })
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: new PublicKey(accounts[0]),
    }).add(TransactionInstruction)

    const signedTx = await solanaWallet.signTransaction(transaction)
    uiConsole(signedTx?.signature?.toString('hex'))
  }

  // const signallTransaction = async () => {
  //   if (!provider) {
  //     uiConsole('provider not initialized yet')
  //     return
  //   }
  //   const solanaWallet = new SolanaWallet(provider)

  //   const connectionConfig: any = await solanaWallet.request({
  //     method: 'solana_provider_config',
  //     params: [],
  //   })

  //   const connection = new Connection(connectionConfig.rpcTarget)

  //   const accounts = await solanaWallet.requestAccounts()
  //   const blockhash = (await connection.getRecentBlockhash('finalized'))
  //     .blockhash
  //   const TransactionInstruction = SystemProgram.transfer({
  //     fromPubkey: new PublicKey(accounts[0]),
  //     toPubkey: new PublicKey(accounts[0]),
  //     lamports: 0.01 * LAMPORTS_PER_SOL,
  //   })
  //   const transaction = new Transaction({
  //     recentBlockhash: blockhash,
  //     feePayer: new PublicKey(accounts[0]),
  //   }).add(TransactionInstruction)

  //   const signedTx = await solanaWallet.signAllTransactions(transaction)
  //   console.log(signedTx.signature)
  //   uiConsole(signedTx.signature)
  // }

  const signandsendTransaction = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const solanaWallet = new SolanaWallet(provider)

    const connectionConfig: any = await solanaWallet.request({
      method: 'solana_provider_config',
      params: [],
    })

    const connection = new Connection(connectionConfig.rpcTarget)

    const accounts = await solanaWallet.requestAccounts()
    const blockhash = (await connection.getRecentBlockhash('finalized'))
      .blockhash
    const TransactionInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(accounts[0]),
      toPubkey: new PublicKey(accounts[0]),
      lamports: 0.01 * LAMPORTS_PER_SOL,
    })
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: new PublicKey(accounts[0]),
    }).add(TransactionInstruction)
    const {signature} = await solanaWallet.signAndSendTransaction(transaction)
    uiConsole(signature)
  }

  const signMessage = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const solanaWallet = new SolanaWallet(provider)
    const msg = Buffer.from('Web3Auth x Solana Message', 'utf8')
    const result = await solanaWallet.signMessage(msg)
    uiConsole(Buffer.from(result).toString('hex'))
  }

  const signSolanaMessage = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }

    const privateKey = await provider.request({
      method: 'solanaPrivateKey',
    })
    console.log(privateKey)

    const solanaPrivateProvider =
      await SolanaPrivateKeyProvider.getProviderInstance({
        chainConfig: {
          rpcTarget: 'https://api.devnet.solana.com',
          blockExplorer: 'https://explorer.solana.com/?cluster=devnet',
          chainId: '0x3',
          displayName: 'solana',
          ticker: 'SOL',
          tickerName: 'Solana',
        },
        privKey: privateKey as string,
      })

    console.log(solanaPrivateProvider)

    if (!solanaPrivateProvider) {
      uiConsole('provider not initialized yet')
      return
    }

    const solanaWallet = new SolanaWallet(solanaPrivateProvider.provider as any)
    const msg = Buffer.from('Web3Auth x Solana', 'utf8')
    const result = await solanaWallet.signMessage(msg)
    uiConsole(Buffer.from(result).toString('hex'))
  }

  function uiConsole(...args: any) {
    const el = document.querySelector('#console>p')
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2)
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get idToken
          </button>
        </div>
        <div>
          <button onClick={parseToken} className="card">
            Parse idToken
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signaTransaction} className="card">
            Sign a Transaction
          </button>
        </div>
        {/* <div>
          <button onClick={signallTransaction} className="card">
            Sign all Transaction
          </button>
        </div> */}
        <div>
          <button onClick={signandsendTransaction} className="card">
            Sign and Send Transaction
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={signSolanaMessage} className="card">
            Sign Message via Solana Provider
          </button>
        </div>
        <div>
          <button onClick={fetchPrivateKey} className="card">
            Fetch Private Key
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>

      <div id="console" style={{whiteSpace: 'pre-line'}}>
        <p style={{whiteSpace: 'pre-line'}}></p>
      </div>
    </>
  )

  const logoutView = (
    <button onClick={login} className="card">
      Login
    </button>
  )

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>{' '}
        & ReactJS Example using Solana
      </h1>

      <div className="grid">{provider ? loggedInView : logoutView}</div>

      <footer className="footer">
        <a
          href="https://github.com/shahbaz17/web3auth-solana-react-demo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  )
}

export default App
