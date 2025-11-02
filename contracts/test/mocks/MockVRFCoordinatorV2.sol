// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFCoordinatorV2Interface} from "./MockVRFInterfaces.sol";

/**
 * @title MockVRFCoordinatorV2
 * @notice Mock VRF Coordinator for testing purposes
 * @dev This mock allows tests to fulfill VRF requests immediately without waiting for Chainlink
 */
contract MockVRFCoordinatorV2 is VRFCoordinatorV2Interface {
    struct RequestConfig {
        bytes32 keyHash;
        uint64 subId;
        uint16 minimumRequestConfirmations;
        uint32 callbackGasLimit;
        uint32 numWords;
    }

    mapping(uint256 => RequestConfig) public requests;
    mapping(uint256 => address) public consumers;
    uint256 public requestCounter;
    uint256 private nonce;

    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 indexed requestId,
        uint256 preSeed,
        uint64 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );

    event RandomWordsFulfilled(uint256 indexed requestId, uint256 outputSeed, uint96 payment, bool success);

    function requestRandomWords(
        bytes32 _keyHash,
        uint64 _subId,
        uint16 _minimumRequestConfirmations,
        uint32 _callbackGasLimit,
        uint32 _numWords
    ) external override returns (uint256 requestId) {
        requestId = requestCounter++;
        requests[requestId] = RequestConfig({
            keyHash: _keyHash,
            subId: _subId,
            minimumRequestConfirmations: _minimumRequestConfirmations,
            callbackGasLimit: _callbackGasLimit,
            numWords: _numWords
        });
        consumers[requestId] = msg.sender;

        emit RandomWordsRequested(
            _keyHash,
            requestId,
            uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, nonce++))),
            _subId,
            _minimumRequestConfirmations,
            _callbackGasLimit,
            _numWords,
            msg.sender
        );

        return requestId;
    }

    /**
     * @notice Fulfill a VRF request with random words
     * @param _requestId The request ID to fulfill
     * @param _consumer The consumer contract address
     */
    function fulfillRandomWords(uint256 _requestId, address _consumer) external {
        RequestConfig memory config = requests[_requestId];
        require(consumers[_requestId] == _consumer, "Invalid consumer");

        uint256[] memory randomWords = new uint256[](config.numWords);
        for (uint32 i = 0; i < config.numWords; i++) {
            randomWords[i] = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, _requestId, i)));
        }

        // Call the consumer's rawFulfillRandomWords function (Chainlink VRF pattern)
        // This will call the consumer's fulfillRandomWords internal function
        (bool success,) = _consumer.call(
            abi.encodeWithSelector(
                bytes4(keccak256("rawFulfillRandomWords(uint256,uint256[])")),
                _requestId,
                randomWords
            )
        );

        emit RandomWordsFulfilled(_requestId, randomWords[0], 0, success);
        require(success, "VRF callback failed");
    }

    /**
     * @notice Fulfill a VRF request with custom random words (for testing specific scenarios)
     * @param _requestId The request ID to fulfill
     * @param _consumer The consumer contract address
     * @param _randomWords The random words to fulfill with
     */
    function fulfillRandomWordsWithValues(uint256 _requestId, address _consumer, uint256[] memory _randomWords) external {
        require(consumers[_requestId] == _consumer, "Invalid consumer");
        RequestConfig memory config = requests[_requestId];
        require(_randomWords.length == config.numWords, "Wrong number of words");

        (bool success,) = _consumer.call(
            abi.encodeWithSelector(
                bytes4(keccak256("rawFulfillRandomWords(uint256,uint256[])")),
                _requestId,
                _randomWords
            )
        );

        emit RandomWordsFulfilled(_requestId, _randomWords[0], 0, success);
        require(success, "VRF callback failed");
    }

    // Required by VRFCoordinatorV2Interface but not used in mock
    function getRequestConfig() external pure override returns (uint16, uint32, bytes32[] memory) {
        revert("Not implemented in mock");
    }

    function requestSubscriptionOwnerTransfer(uint64, address) external pure override {
        revert("Not implemented in mock");
    }

    function acceptSubscriptionOwnerTransfer(uint64) external pure override {
        revert("Not implemented in mock");
    }

    function addConsumer(uint64, address) external pure override {
        revert("Not implemented in mock");
    }

    function removeConsumer(uint64, address) external pure override {
        revert("Not implemented in mock");
    }

    function cancelSubscription(uint64, address) external pure override returns (uint96, uint256) {
        revert("Not implemented in mock");
    }

    function pendingRequestExists(uint64) external pure override returns (bool) {
        revert("Not implemented in mock");
    }

    function getSubscription(uint64)
        external
        pure
        override
        returns (
            uint96,
            uint256,
            uint256,
            address,
            address[] memory
        )
    {
        revert("Not implemented in mock");
    }

    function getConfig()
        external
        pure
        override
        returns (
            uint16,
            uint32,
            bytes32[] memory,
            uint32,
            bytes32,
            uint256,
            address,
            uint256[3] memory,
            address
        )
    {
        revert("Not implemented in mock");
    }

    function getFeeConfig()
        external
        pure
        override
        returns (
            uint32,
            uint32,
            uint32,
            uint32,
            uint32,
            uint224,
            uint256,
            uint256,
            address
        )
    {
        revert("Not implemented in mock");
    }

    function getActiveConfig(uint64) external pure override returns (uint32, uint32, bytes32[] memory) {
        revert("Not implemented in mock");
    }

    function getFallbackWeiPerUnitLink() external pure override returns (uint256) {
        revert("Not implemented in mock");
    }

    function getMaximumNumberOfWords() external pure override returns (uint32) {
        return 500;
    }

    function getMaximumRequestConfirmations() external pure override returns (uint16) {
        return 200;
    }

    function getMinimumRequestBlockConfirmations() external pure override returns (uint16) {
        return 0;
    }

    function getSubscriptionCount() external pure override returns (uint64) {
        revert("Not implemented in mock");
    }

    function getCurrentSubId() external pure override returns (uint64) {
        revert("Not implemented in mock");
    }

    function getVrfCoordinatorAddress() external pure override returns (address) {
        revert("Not implemented in mock");
    }

    function isPendingRequestExists(uint64) external pure override returns (bool) {
        revert("Not implemented in mock");
    }
}

