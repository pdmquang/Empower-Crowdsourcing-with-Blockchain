import { FunctionComponent, useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { PlayerType, VoteType } from "../interfaces";
import useInterval from "./useInterval";

type Props = {
  sessionPlayer: PlayerType | null;
  setSessionPlayer: (player: PlayerType) => void;
  pollingUser: boolean;
  setPollingUser: (polling: boolean) => void
}

const Profile: FunctionComponent<Props> = ({ sessionPlayer, setSessionPlayer, pollingUser, setPollingUser }) => {

  // Profile
  const [count, setCount] = useState(0);
  const [player, setPlayer] = useState<PlayerType>({ userName: "", password: "", credibility: 0, wallet: "", balance: 0 });

  useEffect(() => {
    // console.log("Use effect in Profile is called: ");
    const setStateHome = async () => {
      if (sessionPlayer) {
        // setPlayer(await fetchPlayer(sessionPlayer));
        const newPlayer = await fetchPlayer(sessionPlayer);
        setPlayer(newPlayer);
        console.log("newPlayer in profile: ", newPlayer);
        const result = JSON.stringify(newPlayer);
        sessionStorage.setItem("player", result);
        // setSessionPlayer(player);
      }

    }

    setStateHome();
  }, [sessionPlayer])
  //     setRefresh(false);
  //   }, [refresh])

  const fetchPlayer = async (player: PlayerType): Promise<PlayerType> => {
    try {
      const res = await fetch('http://localhost:4005/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player: player })
      });

      const body = await res.json();
      const result = body.result as PlayerType;
      // setPlayer(result);
      return result

    } catch (error) {
      console.error(error);
      return { userName: "", password: "", credibility: 0, wallet: "", balance: 0 } as PlayerType;
    }
  }

  if (sessionPlayer) {
    return (
      <>
        <div>
          <div className="">
            <div className="font-weight-bold">{player.userName}</div>
            <div className="dropdown-divider"></div>
            <div>{player.balance} tokens</div>
            <div>{player.credibility} credits</div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>

      </>
    )
  }

}

export default Profile;