//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Block is ERC20, Ownable {
    
    uint public buyPrice = 1 ether;

    uint rewardPercent;

    uint public tokenRate;

    mapping(address => uint) public userStake;

    mapping(address => uint) rewardTime;

    constructor() ERC20("Block", "BLK"){
        _mint(owner(), 1000e18);
    }

    function modifyTokenBuyPrice(uint newBuyPrice) public onlyOwner() {
        buyPrice = newBuyPrice;
    }

    function modifyTokenRate(uint newTokenRate) public onlyOwner(){
        tokenRate = newTokenRate;
    }

    function setRewardPercent(uint percent) public onlyOwner() {
        rewardPercent = (percent*1000)/100;
    }

    function buyToken(address receiver) public payable {
        require(msg.value >= 0, "InSufficientBalance");
        uint amount = msg.value*tokenRate*10**18;
        _mint(receiver, amount);
    }

    function stake(uint amount) public {
        require(amount > 0, "inSufficientAmount");
        uint currentStake = userStake[_msgSender()];
        _burn(_msgSender(), amount);
        currentStake += amount;
        userStake[_msgSender()] = currentStake;
    }

    function reward(address receiver) internal {
        uint currentStake = userStake[receiver];
        uint userReward = currentStake * rewardPercent;
        _mint(receiver, userReward/1000);
    }

    function claimReward() public {
       require(rewardTime[msg.sender] >= rewardTime[_msgSender()] + 604800, "Cannot claim reward");
        reward(_msgSender());
        rewardTime[_msgSender()] = block.timestamp;
    }

    function unStake( uint amount) public {
        require(amount > 0, "InvalidAmount");
        require(amount < userStake[_msgSender()], "amount exceed staked amount");
        userStake[_msgSender()] -= amount;
        _mint(_msgSender(), amount);
    } 
}
