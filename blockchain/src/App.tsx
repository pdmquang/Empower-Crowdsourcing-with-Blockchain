import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';

import { NewsType, PlayerType, VoteType } from "./interfaces";
// import Home from './components/Home';
import Sidebar from './components/Sidebar';
import Transaction from './components/Transaction';
import News from './components/News';

import FakeNews from '../artifacts/contracts/FakeNews.sol/FakeNews.json';
import { BigNumber, Contract, ethers } from "ethers";
import { NonceManager } from './contract';

export default function App() {
  const [sessionPlayer, setSessionPlayer] = useState<PlayerType | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [nonceManager, setNonceManager] = useState<NonceManager | null>(null);
  const [polling, setPolling] = useState<boolean>(false);
  const [pollingUser, setPollingUser] = useState<boolean>(false);

  useEffect(() => {
    // console.log("Setup contract is called...")
    // console.log("sessionPlayer in app.tx: ", sessionPlayer);
    try {
      const contractAddress = "0x7106Dbd1560C1bc02dDdD1630C4085Aee2F939Ef"; // Address of Deployed contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const abi = FakeNews.abi as unknown as string;

      const _contract = new Contract(contractAddress, abi, signer);

      _contract.provider.once("block", () => {
        // _contract.on("TransferReward", async (...params) => {

        //   const [voteId, playerId, rewardAmt, to] = params;
        //   console.log("TransferReward with params: ", params);

        // })
        _contract.on("ContractDischarge", async (...params) => {

          const [voteId, playerId, rewardAmt, to] = params;
          // console.log("TransferReward with params: ", params);
          setPollingUser(true);

        })
        _contract.on("CreateVote", async (...params) => {

          const [voteId, playerId, token, address] = params;
          console.log("CreateVote with params: ", params);
          setPolling(true);

        })

        _contract.on("Register", async (...params) => {
          const [voteId, playerId, token, address] = params;
          console.log("Register with params: ", params);
        })
      })
      
      setNonceManager(new NonceManager(signer));
      setContract(_contract);
      
    } catch (error) {
      console.log("App: ", error);
    }
    

  }, [sessionPlayer])

  useEffect(() => {
    if (sessionStorage.getItem("player")) {

      const player = JSON.parse(sessionStorage.getItem("player") as any)
      const getUser = async() => {
        setSessionPlayer(await fetchUser(player));
      }

      getUser();
    } else {
      console.log("No user right now")
    }
    
  }, [sessionStorage.getItem("player")]);

  const fetchUser = async (player: any) => {
    try {

        const res = await fetch('http://localhost:4005/player', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ player: player })
      })

      const body = await res.json();

      const result = body.result as PlayerType;
      return result;

    } catch (error) {
        console.error(error);
        return { userName: "", password: "", wallet: "", credibility: 0, balance: 0 };
    }
}

  return (
    <BrowserRouter>
      <div id="wrapper">
        <Sidebar />
        {/* <PlayerSession.Provider value={{ session, setSession }}> */}
        <div id='content-wrapper' className='d-flex flex-column'>
          <Navbar sessionPlayer={sessionPlayer} setSessionPlayer={setSessionPlayer} pollingUser={pollingUser} setPollingUser={setPollingUser}/>
          <div id='content' >
            <div className="container-fluid">
              <Routes>
                <Route path="/" element={<News contract={contract} nonceManager={nonceManager} sessionPlayer={sessionPlayer} polling={polling} setPolling={setPolling}/>} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/transaction" element={<Transaction sessionPlayer={sessionPlayer} />} />
              </Routes>
            </div>
          </div>
        </div>
        {/* </PlayerSession.Provider> */}
      </div>
    </BrowserRouter>

  )
}


// const delay = 1000; // poll every 1s

  // const [refresh, setRefresh] = useState<Boolean>(false);
  // const [polling, setPolling] = useState<Boolean>(false);
  

  // const checkBackendStatus = async (voteId: string) => {
  //   // console.log("checkBackendStatus is called")
  //   try {
  //     const res = await fetch(`http://localhost:4005/vote/${voteId}`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     const body = await res.json();
  //     const voteResult: VoteType = body.result;
  //     // console.log("voteResult: ", voteResult);

  //     const status = voteResult.status as unknown as string;
  //     const hasTransfered = voteResult.hasTransfered as unknown as boolean;
  //     // console.log("status: ", status);
  //     // console.log("hasTransfered: ", hasTransfered);


  //     if (["Complete", "Failed"].includes(status) || hasTransfered) {
  //       // Refresh UI
  //       // console.log("txVoteIds.length: ", txVoteIds.length);
  //       console.log("Set refresh to true");

  //       setRefresh(true);
  //       // setTxVoteIds(prev => {
  //       //     const copy = [...prev];
  //       //     const index = copy.indexOf(voteId);
  //       //     copy.splice(i, 1);
  //       //     return copy;
  //       // });
  //     }

  //     return body.result;
  //   } catch (error) {
  //     console.error(error);
  //     return "Error";
  //   }
  // }
  // useInterval(async () => {
  //     console.log("Polling is called");
  //     await checkBackendStatus(voteId);
  // },
  //     // If there is any new player or vote or news, activate polling to retrieve data
  //     (polling) ? delay : null,
  // )
