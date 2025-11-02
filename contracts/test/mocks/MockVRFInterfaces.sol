// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VRFCoordinatorV2Interface
 * @notice Minimal interface for VRF Coordinator V2 - used for testing
 * @dev This is a simplified version for testing purposes
 */
interface VRFCoordinatorV2Interface {
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);

    function getRequestConfig() external view returns (uint16, uint32, bytes32[] memory);
    function requestSubscriptionOwnerTransfer(uint64 subId, address newOwner) external;
    function acceptSubscriptionOwnerTransfer(uint64 subId) external;
    function addConsumer(uint64 subId, address consumer) external;
    function removeConsumer(uint64 subId, address consumer) external;
    function cancelSubscription(uint64 subId, address to) external returns (uint96, uint256);
    function pendingRequestExists(uint64 subId) external view returns (bool);
    function getSubscription(uint64 subId)
        external
        view
        returns (
            uint96 balance,
            uint256 reqCount,
            address owner,
            address[] memory consumers
        );
    function getConfig()
        external
        view
        returns (
            uint16 minimumRequestConfirmations,
            uint32 maxGasLimit,
            bytes32[] memory s_provingKeyHashes,
            uint32 s_maxNumWords,
            bytes32 s_keyHash,
            uint256 s_provingKeyHashToConfig,
            address s_link,
            uint256[3] memory s_feeConfig,
            address s_wrapperConsumer
        );
    function getFeeConfig()
        external
        view
        returns (
            uint32 fulfillmentFlatFeeLinkPPMTier1,
            uint32 fulfillmentFlatFeeLinkPPMTier2,
            uint32 fulfillmentFlatFeeLinkPPMTier3,
            uint32 fulfillmentFlatFeeLinkPPMTier4,
            uint32 reqCountForDiscount,
            uint224 reqCountForDiscountThreshold,
            uint256 s_fulfillmentFlatFeeLinkPPM,
            uint256 s_fulfillmentFlatFeeNativePPM,
            address s_wrapperConsumer
        );
    function getActiveConfig(uint64 subId) external view returns (uint32, uint32, bytes32[] memory);
    function getFallbackWeiPerUnitLink() external view returns (uint256);
    function getMaximumNumberOfWords() external view returns (uint32);
    function getMaximumRequestConfirmations() external view returns (uint16);
    function getMinimumRequestBlockConfirmations() external view returns (uint16);
    function getSubscriptionCount() external view returns (uint64);
    function getCurrentSubId() external view returns (uint64);
    function getVrfCoordinatorAddress() external view returns (address);
    function isPendingRequestExists(uint64 subId) external view returns (bool);
}

/**
 * @title VRFConsumerBaseV2
 * @notice Base contract for VRF consumers - simplified for testing
 */
abstract contract VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface internal immutable COORDINATOR;

    constructor(address _vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
    }

    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        require(msg.sender == address(COORDINATOR), "Only coordinator can fulfill");
        fulfillRandomWords(requestId, randomWords);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual;
}

