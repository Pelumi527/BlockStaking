//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Block is ERC20, Ownable {
    
    uint public buyPrice = 0.01 ether;

    uint rewardPercent;

    mapping(address => uint) public userStake;

    mapping(address => uint) rewardTime;

    constructor() ERC20("Block", "BLK"){
        _mint(owner(), 1000e18);
    }

    function modifyTokenBuyPrice(uint newBuyPrice) public onlyOwner() {
        buyPrice = newBuyPrice;
    }

    function setRewardPercent(uint percent) public onlyOwner() {
        rewardPercent = (percent*1000)/100;
        console.log(rewardPercent);
        console.log(percent);
    }

    function buyToken(address receiver) public payable {
        require(msg.value > 0, "insufficentBalance");
        uint amount = msg.value*1000e18;
        _mint(receiver, amount);
    }

    function stake(uint amount) public {
        require(amount > 0, "inSufficientAmount");
        uint currentStake = userStake[_msgSender()];
        _burn(_msgSender(), amount);
        currentStake += amount;
        userStake[_msgSender()] = currentStake;
        rewardTime[_msgSender()] = block.timestamp;
    }

    function reward(address receiver) internal {
        uint currentStake = userStake[receiver];
        uint userReward = currentStake * rewardPercent;
        console.log(userReward);
        _mint(receiver, userReward/1000);
    }

    function claimReward() public {
        require(block.timestamp >= rewardTime[msg.sender], "Cannot claim stake");
        reward(_msgSender());
        rewardTime[_msgSender()] += 604800; // 7 days in second
    }

    function unStake( uint amount) public {
        require(amount > 0, "InvalidAmount");
        require(amount < userStake[_msgSender()], "amount exceed staked amount");
        userStake[_msgSender()] -= amount;
        _mint(_msgSender(), amount);
    } 
}
