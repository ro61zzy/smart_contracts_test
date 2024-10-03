// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract SimpleLudo {

    uint constant public NUM_PLAYERS = 4;
    uint constant public BOARD_SIZE = 52;
    bool public gameStarted = false;
    address[NUM_PLAYERS] public players;

    mapping(address => uint) public tokenPosition;

    uint public currentPlayerIndex = 0;
    uint public playerCount = 0;

    event DiceRolled(address indexed player, uint diceResult);
    event TokenMoved(address indexed player, uint newPosition);

    modifier gameIsActive() {
        require(gameStarted, "Game has not started yet.");
        _;
    }
    
    modifier isPlayerTurn() {
        require(players[currentPlayerIndex] == msg.sender, "It's not your turn!");
        _;
    }

    function joinGame() external {
        require(playerCount < NUM_PLAYERS, "The game already has enough players.");
        require(!_isPlayerInGame(msg.sender), "You have already joined the game.");

        players[playerCount] = msg.sender;
        tokenPosition[msg.sender] = 0;  
        playerCount++;
        
        if (playerCount == NUM_PLAYERS) {
            gameStarted = true; 
        }
    }

    function rollDiceAndMove() external gameIsActive isPlayerTurn {
        uint diceResult = _rollDice();

        emit DiceRolled(msg.sender, diceResult);
        uint newPosition = (tokenPosition[msg.sender] + diceResult) % BOARD_SIZE;
        tokenPosition[msg.sender] = newPosition;
        emit TokenMoved(msg.sender, newPosition);
        currentPlayerIndex = (currentPlayerIndex + 1) % NUM_PLAYERS;
    }

    function _rollDice() internal view returns (uint) {
        uint randomHash = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        return (randomHash % 6) + 1;
    }
    
    function _isPlayerInGame(address player) internal view returns (bool) {
        for (uint i = 0; i < playerCount; i++) {
            if (players[i] == player) {
                return true;
            }
        }
        return false;
    }
}
