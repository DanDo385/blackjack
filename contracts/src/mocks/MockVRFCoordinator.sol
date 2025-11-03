// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockVRFCoordinator {
    uint256 private requestCounter;
    
    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );
    
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256) {
        requestCounter++;
        emit RandomWordsRequested(
            keyHash,
            requestCounter,
            subId,
            minimumRequestConfirmations,
            callbackGasLimit,
            numWords,
            msg.sender
        );
        return requestCounter;
    }
    
    // Allow manual fulfillment for testing
    function fulfillRandomWords(uint256 requestId, address consumer) external {
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, requestId)));
        
        // Call the consumer's rawFulfillRandomWords function
        (bool success,) = consumer.call(
            abi.encodeWithSignature("rawFulfillRandomWords(uint256,uint256[])", requestId, randomWords)
        );
        require(success, "Failed to fulfill random words");
    }
}
