//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./_ERC20.sol";

uint constant LIMIT = 3; 
uint256 constant BIG_NUMBER = 10**10;

struct Memo {
    uint count;
    uint256 balance;
}

struct Vote {
    bool result;
    uint credibility;
    uint256 stakedToken;
}

contract FakeNews is FakeNewsToken {
    address public owner_;
    mapping(string => Memo) public transactionHistory;

    constructor() {
        owner_ = msg.sender;
    }

    event CreateVote(string voteId, string playerId, uint256 token, address from);
    event Register(string playerId, uint256 token, address to);
    event PlayerReward(bool verdict, string newsId, uint amount);
    event TransferReward(string voteId, string playerId, uint256 rewardAmt, address to);

    event ContractDischarge(string _newsId, string _playerId);
    event Refund(string _newsId); // Optional

    function transferReward(string memory voteId, string memory playerId, uint256 rewardAmt, address to) public {
        approve(owner_, rewardAmt);
        transferFrom(owner_, to, rewardAmt);
        emit TransferReward(voteId, playerId, rewardAmt, to);
    }
    
    function createVote(string memory _voteId, string memory _playerId, string memory _newsId, uint256 _token) public {
        // User can only bet between 1 to 5 tokens (max = 5)
        require(_token >= 1 * BIG_NUMBER && _token <= 5 * BIG_NUMBER, "Player needs to stake from 1 to 5 tokens.");  
        require(transactionHistory[_newsId].count < LIMIT, "This news has been expired.");

        transfer(owner_, _token);
        emit CreateVote(_voteId, _playerId, _token, msg.sender);

        transactionHistory[_newsId].count++;
        transactionHistory[_newsId].balance += _token;

        if (transactionHistory[_newsId].count == LIMIT) {
            emit ContractDischarge(_newsId, _playerId);
        }
    }

    function register(string memory _playerId, address _to, uint256 _token) public {
        mint(_to, _token);
        emit Register(_playerId, _token, _to); // Update tokens to database
    }

    // Size of Vote should be [LIMIT + 1], +1 for AI vote
    function calcPlayerReward(Vote[] memory _voteArr, string memory _newsId) public {
        // *** NOTE: Currently, Player type AI is not being considered.
        // By right, the weightage of the robot's vote is a dynamic variable (k) 
        // that is changed based on the model's performance (eg. eval accuracy)
        bool verdict = false;

        uint winnerCnt = 0;
        uint256 fake = 0;
        uint256 real = 0;
        uint256 prizePool = 0;

        for (uint256 i = 0; i < _voteArr.length; i++) {
            Vote memory v = _voteArr[i];

            uint256 score = v.credibility * v.stakedToken;
            if (v.result == true)
                fake += score;
            else
                real += score;
        }
        
        if (fake == real) {
            emit Refund(_newsId); // very UNLIKELY this is called;
            return;
        }

        verdict = (fake > real) ? true : false; // what if fake ==  real

        for (uint256 i = 0; i < _voteArr.length; i++) {
            Vote memory v = _voteArr[i];
            if (v.result != verdict) {
                // loser
                prizePool += v.stakedToken;
            } else {
                winnerCnt++;
            }
        }

        uint256 rewardAmt = prizePool / winnerCnt;
        emit PlayerReward(verdict, _newsId, rewardAmt);
        
    }
}