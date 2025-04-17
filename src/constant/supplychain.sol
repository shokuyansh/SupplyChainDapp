// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Tracking{
    enum ShipmentStatus{PENDING,IN_TRANSIT,DELIVERED}
    
    struct Shipment{
        address sender;
        address reciever;
        uint pickupTime;
        uint deliveryTime;
        uint price;
        uint distance;
        ShipmentStatus status;
        bool isPaid;
    }
    mapping(address=>Shipment[]) shipments;
    uint public shipmentCount;


    struct typeShipment{
        uint256 index;
        address sender;
        address reciever;
        uint pickupTime;
        uint deliveryTime;
        uint price;
        uint distance;
        ShipmentStatus status;
        bool isPaid;
    }
    typeShipment[] public typeshipments;

    event ShipmentCreated(uint256 SID,address indexed sender,address indexed reciever,
    uint distance,uint price);
    event ShipmentInTransit(address indexed sender,address indexed reciever,
    uint pickupTime);
    event ShipmentDelivered(address indexed sender,address indexed reciever,
    uint deliveryTime);
    event ShipmentPaid(address indexed sender,address indexed reciever,
    uint amount);
    
    
    
    function createShipment(address _reciever,uint _distance,uint _price) external payable {
        require(msg.value== _price,"Payment Amount must match the price!");
        require(msg.sender!=_reciever,"Cannot ship to oneself");
        require(_distance>0,"distance should be greater than 0");
        require(_price>0,"Price cannot be zero");
        Shipment memory shipment = Shipment(msg.sender,_reciever,0,0,_price,_distance,ShipmentStatus.PENDING,false);
        typeshipments.push(typeShipment(shipments[msg.sender].length,msg.sender,_reciever,0,0,_price,_distance,ShipmentStatus.PENDING,false));
        shipments[msg.sender].push(shipment);
        emit ShipmentCreated(shipmentCount,msg.sender, _reciever, _distance, _price);
        shipmentCount++;
        
    }

    function startShipment(address _reciever,uint _sid) external{
        typeShipment storage typeshipment = typeshipments[_sid];
        require(typeshipment.sender==msg.sender,"Not the shipment Sender!");
        uint _index=typeshipment.index;
        address _sender=msg.sender;
        Shipment storage shipment = shipments[_sender][_index];
        require(shipment.reciever==_reciever,"Invalid Reciever Address!");
        require(shipment.status==ShipmentStatus.PENDING,"Shipment already in transit");
        shipment.status=ShipmentStatus.IN_TRANSIT;
        typeshipment.status=ShipmentStatus.IN_TRANSIT;
        shipment.pickupTime=block.timestamp;
        typeshipment.pickupTime=block.timestamp;
        emit ShipmentInTransit(_sender, _reciever, shipment.pickupTime);
    }
    
    function completeShipment(address _reciever,uint _sid) external {
        require(_sid<shipmentCount,"Invalid Shipment ID!");
        typeShipment storage typeshipment = typeshipments[_sid];
        require(typeshipment.sender==msg.sender,"Not the shipment Sender!");
        address _sender=msg.sender;
        uint _index=typeshipment.index;
        Shipment storage shipment = shipments[_sender][_index];
        require(shipment.reciever==_reciever,"INvalid Reciever Address!");
        require(shipment.status==ShipmentStatus.IN_TRANSIT,"Shipment in-transit");
        require(shipment.isPaid==false,"Shipment is already paid!");
        shipment.status=ShipmentStatus.DELIVERED;
        typeshipment.status=ShipmentStatus.DELIVERED;
        shipment.isPaid=true;
        typeshipment.isPaid=true;
        shipment.deliveryTime=block.timestamp;
        typeshipment.deliveryTime=block.timestamp;
        payable(_sender).transfer(shipment.price);

        emit ShipmentDelivered(_sender,_reciever, shipment.deliveryTime);
        emit ShipmentPaid(_sender,_reciever, shipment.price);
    }
    
    function getShipment(address _sender,uint _sid) external  view returns(address,address,uint,uint,uint,uint,ShipmentStatus,bool){
        require(_sid<=shipmentCount,"Invalid Shipment ID!");
        require(shipments[_sender].length>0,"NO shipments under this sender");
        typeShipment storage typeshipment = typeshipments[_sid];
        uint _index=typeshipment.index;
        Shipment memory shipment = shipments[_sender][_index];
        return (shipment.sender,shipment.reciever,shipment.pickupTime,shipment.deliveryTime,shipment.price,shipment.distance,shipment.status,shipment.isPaid);
    }

    function getShipmentCount(address _sender) external view returns(uint){
        return shipments[_sender].length;
    }
    function getAllTransactions() external view returns(typeShipment[] memory){
        return typeshipments;
    }
}