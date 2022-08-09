# Incentivise Crowdsourcing with Blockchain and Ethereum

## Design Proposal 
(*Refer to the ***FinalReport.pdf and Powerpoint.pdf*** for more detail about the project.* )

I present the system that makes use of Ethereum Blockchain technology to provide incentives for anyone
to start building a bigger corpus of labeled fake news and subsequently increase the
effectiveness of our fake news detection model.



## Technologies used
This project is implemented using 
* Language: React.js, NodeJS, Solidity
* Framework: Hardhat, MongoDB, Ethers, Etherscan, Rinkeby testnet

## What you require to run this project
* MongoDB docker instance
* Install all dependencies in **package.json** for blockchain and server folders
* Install MetaMask extensions

## Flow of interaction when user creates a vote
![plot](./flowcharts/CreateVote%20flow.png)

## Flow of interaction when a news acquires enough votes from users, and will be processed by smart contract on Blockchain automatically
![plot](./flowcharts/Discharge%20Contract.png)