// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriChain Escrow Contract
 * @dev Implements a secure escrow model for the agricultural supply chain.
 * @dev Farmer -> Distributor -> Retailer (who funds and confirms)
 */
contract AgriChainEscrow {

    // --- STATE VARIABLES ---

    uint public batchCount;

    // Enums for tracking status
    enum BatchStatus { 
        HARVESTED,  // Farmer created
        FUNDED,     // Retailer locked payment
        PICKED_UP,  // Distributor has goods
        DELIVERED,  // Retailer confirmed, Farmer paid
        DENIED,     // Retailer denied delivery
        REFUNDED    // Farmer approved refund
    }
    
    enum ItemStatus { PENDING, ACTIVE, CONSUMED }

    struct Batch {
        uint batchId;
        string produceName;
        string farmLocation;
        string ipfsHash;
        uint harvestTimestamp;
        
        address payable farmer;
        address distributor;
        address payable retailer; 
        
        uint price;
        BatchStatus status;
        bool isFunded; // True when escrow is filled
        bool isPaid;   // True when farmer is paid
        
        uint pickupTimestamp;
        uint deliveryTimestamp;
    }

    struct Item {
        uint batchId;
        ItemStatus status;
        bool isRegistered;
    }

    // Mappings
    mapping(uint => Batch) public batches;
    mapping(bytes32 => Item) public allItems;
    Batch[] public allBatchesArray;

    // --- EVENTS ---

    event BatchCreated(uint indexed batchId, address indexed farmer, address retailer, string produceName);
    event BatchFunded(uint indexed batchId, address indexed retailer, uint amount);
    event DistributorPickup(uint indexed batchId);
    event DeliveryConfirmed(uint indexed batchId, address indexed farmer, uint amount);
    event DeliveryDenied(uint indexed batchId, address indexed retailer);
    event RefundApproved(uint indexed batchId, address indexed retailer, uint amount);
    event ItemConsumed(bytes32 indexed serialHash);
    
    // --- MODIFIERS ---

    modifier onlyFarmer(uint _batchId) {
        require(msg.sender == batches[_batchId].farmer, "Caller is not the farmer");
        _;
    }
    
    modifier onlyDistributor(uint _batchId) {
        require(msg.sender == batches[_batchId].distributor, "Caller is not the distributor");
        _;
    }

    modifier onlyRetailer(uint _batchId) {
        require(msg.sender == batches[_batchId].retailer, "Caller is not the retailer");
        _;
    }

    // --- FUNCTIONS (FARMER ROLE) ---

    function createBatch(
        string memory _produceName,
        string memory _farmLocation,
        string memory _ipfsHash,
        address _distributor,
        address payable _retailer, 
        uint _price,
        bytes32[] calldata _itemSerialHashes
    ) external {
        require(_distributor != address(0) && _retailer != address(0), "Invalid addresses");
        require(_price > 0, "Price must be greater than zero");
        require(_itemSerialHashes.length > 0, "Must register at least one item");

        uint batchId = batchCount;

        Batch storage newBatch = batches[batchId];
        newBatch.batchId = batchId;
        newBatch.produceName = _produceName;
        newBatch.farmLocation = _farmLocation;
        newBatch.ipfsHash = _ipfsHash;
        newBatch.harvestTimestamp = block.timestamp;
        newBatch.farmer = payable(msg.sender);
        newBatch.distributor = _distributor;
        newBatch.retailer = _retailer;
        newBatch.price = _price;
        newBatch.status = BatchStatus.HARVESTED;
        

        for (uint i = 0; i < _itemSerialHashes.length; i++) {
            bytes32 serialHash = _itemSerialHashes[i];
            require(!allItems[serialHash].isRegistered, "Serial number already exists");
            allItems[serialHash] = Item(batchId, ItemStatus.PENDING, true);
        }

        allBatchesArray.push(newBatch);
        emit BatchCreated(batchId, msg.sender, _retailer, _produceName);
        batchCount++;
    }

    /**
     * @dev Farmer's action to approve a refund for a DENIED batch.
     */
    function approveRefund(uint _batchId) external onlyFarmer(_batchId) {
        Batch storage batch = batches[_batchId];
        require(batch.status == BatchStatus.DENIED, "Batch was not denied");
        require(batch.isFunded, "Batch was not funded");
        
        batch.isFunded = false;
        batch.status = BatchStatus.REFUNDED;
        
        // Update array copy
        allBatchesArray[_batchId] = batch;

        (bool success, ) = batch.retailer.call{value:batch.price}("");
        require(success, "Refund transfer failed");

        emit RefundApproved(_batchId, batch.retailer, batch.price);
    }

    // --- FUNCTIONS (DISTRIBUTOR ROLE) ---

    function confirmPickupByDistributor(uint _batchId) external onlyDistributor(_batchId) {
        Batch storage batch = batches[_batchId];
        // Farmer should not release goods until batch is funded
        require(batch.status == BatchStatus.FUNDED, "Batch not funded by retailer");
        
        batch.status = BatchStatus.PICKED_UP;
        batch.pickupTimestamp = block.timestamp;
        
        allBatchesArray[_batchId] = batch;
        emit DistributorPickup(_batchId);
    }

    // --- FUNCTIONS (RETAILER ROLE) ---

    /**
     * @dev Retailer locks payment in the contract (Escrow).
     */
    function fundBatch(uint _batchId) external payable onlyRetailer(_batchId) {
        Batch storage batch = batches[_batchId];
        require(batch.status == BatchStatus.HARVESTED, "Batch not in HARVESTED state");
        require(msg.value == batch.price, "Incorrect payment amount");
        
        batch.isFunded = true;
        batch.status = BatchStatus.FUNDED;
        
        allBatchesArray[_batchId] = batch;
        emit BatchFunded(_batchId, msg.sender, msg.value);
    }

    /**
     * @dev Retailer confirms delivery, which pays the farmer.
     */
    function confirmDelivery(uint _batchId) external onlyRetailer(_batchId) {
        Batch storage batch = batches[_batchId];
        require(batch.status == BatchStatus.PICKED_UP, "Batch not in transit");
        require(batch.isFunded, "Batch was not funded");
        
        batch.isPaid = true;
        batch.status = BatchStatus.DELIVERED;
        batch.deliveryTimestamp = block.timestamp;
        
        allBatchesArray[_batchId] = batch;

        (bool success, ) = batch.farmer.call{value:batch.price}("");
        require(success, "Payment transfer failed");

        emit DeliveryConfirmed(_batchId, batch.farmer, batch.price);
    }

    /**
     * @dev Retailer denies delivery, flagging it for the farmer.
     * @dev This DOES NOT issue a refund. It just changes the state.
     */
    function denyDelivery(uint _batchId) external onlyRetailer(_batchId) {
        Batch storage batch = batches[_batchId];
        require(batch.status == BatchStatus.PICKED_UP, "Batch not in transit");
        require(batch.isFunded, "Batch was not funded");

        batch.status = BatchStatus.DENIED;
        
        allBatchesArray[_batchId] = batch;
        emit DeliveryDenied(_batchId, msg.sender);
    }

    /**
     * @dev Retailer "consumes" an item at the point of sale.
     * @dev This is separate from payment.
     */
    function consumeItemByRetailer(bytes32 _serialHash) external {
        Item storage item = allItems[_serialHash];
        require(item.isRegistered, "Invalid serial");
        
        Batch storage batch = batches[item.batchId];
        require(msg.sender == batch.retailer, "Only retailer can consume item");
        require(item.status == ItemStatus.ACTIVE, "Item is not active");

        item.status = ItemStatus.CONSUMED;
        emit ItemConsumed(_serialHash);
    }

    // --- FUNCTIONS (PUBLIC) ---

    // The consumer-facing functions (getHistory, getAllBatches, etc.)
    // do not need to change from the previous version.
    
    // ... (Add back getHistory, activateItemsByRetailer, etc.) ...
    
    // NOTE: activateItemsByRetailer is still needed.
    function activateItemsByRetailer(uint _batchId, bytes32[] calldata _itemSerialHashes) external onlyRetailer(_batchId) {
        Batch storage batch = batches[_batchId];
        // Can be activated once funded or picked up
        require(batch.status == BatchStatus.FUNDED || batch.status == BatchStatus.PICKED_UP, "Batch not ready for activation");

        for (uint i = 0; i < _itemSerialHashes.length; i++) {
            bytes32 serialHash = _itemSerialHashes[i];
            Item storage item = allItems[serialHash];
            
            if (item.batchId == _batchId && item.status == ItemStatus.PENDING) {
                item.status = ItemStatus.ACTIVE;
            }
        }
        // No event needed, or add one if you want
    }
    
    function getHistory(bytes32 _serialHash) external view returns (string memory verificationStatus, Batch memory batchInfo) {
        Item storage item = allItems[_serialHash];

        if (!item.isRegistered) {
            return ("INVALID", batchInfo);
        }
        
        batchInfo = batches[item.batchId];

        if (item.status == ItemStatus.ACTIVE) {
            return ("VERIFIED_ACTIVE", batchInfo);
        } else if (item.status == ItemStatus.CONSUMED) {
            return ("ALREADY_CONSUMED", batchInfo);
        } else if (item.status == ItemStatus.PENDING) {
            return ("NOT_YET_IN_STORE", batchInfo);
        }

        return ("INVALID", batchInfo); // Should be unreachable
    }

    function getAllBatches() external view returns (Batch[] memory) {
        return allBatchesArray;
    }
}