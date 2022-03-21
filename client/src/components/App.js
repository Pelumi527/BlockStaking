import { useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import Countdown from 'react-countdown'
import Web3 from 'web3'

// Import Images + CSS
import logo from '../images/logo.png'
import happyImage from '../images/happy.png'
import excitedImage from '../images/excited.png'
import sadImage from '../images/sad.png'
import './App.css'

// Import ABI + Config
import OpenEmoji from '../abis/OpenEmoji.json';
import CONFIG from '../config.json';
import { ethers } from 'ethers'

function App() {
	const [web3, setWeb3] = useState(null)
	const [openEmoji, setOpenEmoji] = useState(null)
	const [showBal, setShowBal] = useState()

	const [userStake, setUserStake] = useState(0)
	const [balanceOf, setBalanceOf] = useState(0)

	const [account, setAccount] = useState(null)
	const [currentNetwork, setCurrentNetwork] = useState(null)

	const [blockchainExplorerURL, setBlockchainExplorerURL] = useState('https://rinkeby.etherscan.io/')

	const [stakeAmount, setStakeAmount] = useState(false)
	const [isError, setIsError] = useState(false)
	const [message, setMessage] = useState(null)

	const [toAddress, setToAddress] = useState(new Date().getTime())
	const [transferAmount, setTransferAmount] = useState(0)

	const loadBlockchainData = async () => {
		// Fetch Contract, Data, etc.
		if (web3) {
			const networkId = await web3.eth.net.getId()
			setCurrentNetwork(networkId)

			try {
				const openEmoji = new web3.eth.Contract(OpenEmoji.abi, "0x18e3be832E5f7e8dd3E263B290EdF9827f00e20f")
				setOpenEmoji(openEmoji)
				const userstake = await openEmoji.methods.userStake(account).call()
				setUserStake(userstake)
				const bal = await openEmoji.methods.balanceOf(account).call()
				setBalanceOf(bal)

				// const maxSupply = await openEmoji.methods.maxSupply().call()
				// const totalSupply = await openEmoji.methods.totalSupply().call()
				// setSupplyAvailable(maxSupply - totalSupply)

				// const balanceOf = await openEmoji.methods.balanceOf(account).call()
				// setBalanceOf(balanceOf)

				// const allowMintingAfter = await openEmoji.methods.allowMintingAfter().call()
				// const timeDeployed = await openEmoji.methods.timeDeployed().call()
				// setRevealTime((Number(timeDeployed) + Number(allowMintingAfter)).toString() + '000')

				if (networkId !== 5777) {
					setBlockchainExplorerURL(CONFIG.NETWORKS[networkId].blockchainExplorerURL)
				}

			} catch (error) {
				setIsError(true)
				setMessage("Contract not deployed to current network, please change network in MetaMask")
			}

		}
	}

	const loadWeb3 = async () => {
		if (typeof window.ethereum !== 'undefined' && !account) {
			const web3 = new Web3(window.ethereum)
			setWeb3(web3)

			const accounts = await web3.eth.getAccounts()

			if (accounts.length > 0) {
				setAccount(accounts[0])
			} else {
				setMessage('Please connect with MetaMask')
			}

			window.ethereum.on('accountsChanged', function (accounts) {
				setAccount(accounts[0])
				setMessage(null)
			});

			window.ethereum.on('chainChanged', (chainId) => {
				// Handle the new chain.
				// Correctly handling chain changes can be complicated.
				// We recommend reloading the page unless you have good reason not to.
				window.location.reload();
			});
		}
	}

	// MetaMask Login/Connect
	const web3Handler = async () => {
		if (web3) {
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			setAccount(accounts[0])
		}
	}

	const handleStakeAmount = (e) => {
		setStakeAmount(e.target.value)
	}

	const handleTransferAmount = (e) => {
		setTransferAmount(e.target.value)
	}

	const handleTransferTo = (e) => {
		setToAddress(e.target.value)
	}

	const Stake = async () => {
		const amount = ethers.utils.parseUnits(stakeAmount, "ether")
		console.log(amount)
		try {
			await openEmoji.methods.stake(amount).send({ from: account})
		} catch (error) {
			console.log(error)
		}
	};

	const balance = () => {
		const tokenBal = ethers.utils.formatUnits(balanceOf, 18)
		setShowBal(tokenBal)
	}

	const transfer = async () => {
		const amount = ethers.utils.parseUnits(transferAmount, "ether")
		try {
			await openEmoji.methods.transfer(toAddress, amount).send({from: account})
		} catch (error) {
			console.error(error)
		}
	}


	
	useEffect(() => {
		loadWeb3()
		loadBlockchainData()
	}, [account]);

	return (
		<div>
			<nav className="navbar fixed-top mx-3">
				{/* <a
					className="navbar-brand col-sm-3 col-md-2 mr-0 mx-4"
					href="http://www.dappuniversity.com/bootcamp"
					target="_blank"
					rel="noopener noreferrer"
				>
					<img src={logo} className="App-logo" alt="logo" />
					
				</a> */}

				{account ? (
					<a
						href={`https://rinkeby.etherscan.io/address/${account}`}
						target="_blank"
						rel="noopener noreferrer"
						className="button nav-button btn-sm mx-4">
						{account.slice(0, 5) + '...' + account.slice(38, 42)}
					</a>
				) : (
					<button onClick={web3Handler} className="button nav-button btn-sm mx-4">Connect Wallet</button>
				)}
			</nav>
			<main>
				<Row className="my-3">
					<Col className="text-center">
						<h1 className="text-uppercase">Staking</h1>
						<p>Your current stake is {userStake/10**18}{` `}BLk</p>
					</Col>
				</Row>
				<Row className="">
					<Col className="panel grid" sm={12} md={4}>
						<input onChange={handleStakeAmount}></input>
						<button onClick={Stake} className="button mint-button"><span>Stake</span></button>
					</Col>
					<Col className="panel grid" md={4}>
						<button className='button mint-button' onClick={balance} ><span>View my balance</span></button>
						<p className='text-center'>{showBal} BLK</p>
					</Col>
					<Col className='panel grid' md={4}>
						<input onChange={handleTransferTo} placeholder='to' className='my-4'></input>
						<input onChange={handleTransferAmount} placeholder='amount'></input>
						<button onClick={transfer} className='button'><span>Transfer</span></button>
					</Col>
				</Row>
				<Row className="my-3">
					<Col className="flex">
						<a href={`${blockchainExplorerURL}address/${account}`} target="_blank" rel="noreferrer" className="button">My Rinkebyscan</a>
					</Col>
				</Row>
				<Row className="my-2 text-center">
					{message ? (
						<p>{message}</p>
					) : (
						<div>
							{openEmoji &&
								<a href={`${blockchainExplorerURL}address/0x18e3be832E5f7e8dd3E263B290EdF9827f00e20f`}
									target="_blank"
									rel="noreferrer"
									className="contract-link d-block my-3">
									{openEmoji._address}
								</a>
							}

							{CONFIG.NETWORKS[currentNetwork] && (
								<p>Current Network: {CONFIG.NETWORKS[currentNetwork].name}</p>
							)}
							<p></p>
						</div>
					)}
				</Row>
			</main>
		</div>
	)
}

export default App;
