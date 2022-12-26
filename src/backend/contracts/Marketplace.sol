// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard {

    // Variables
    address payable public immutable feeAccount; // the account that receives fees
    uint public immutable feePercent; // the fee percentage on sales
    uint public itemCount;
    uint public auctionItemCount;

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    struct AuctionItem {
        uint auctionId;
        IERC721 nft;
        uint tokenId;
        uint price;
        uint timeToEnd;
        address payable winner;
        address payable seller;
        uint deposited;
        bool claimed;
    }

    // itemId -> Item
    mapping(uint => Item) public items;
    mapping(uint => AuctionItem) public auctionItems;

    event Offered(
        uint itemId,
        address nft,
        uint indexed tokenId,
        uint price,
        address indexed seller
    );
    event Bought(
        uint itemId,
        address nft,
        uint indexed tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    event AuctionStarted(
        uint auctionId,
        address nft,
        uint indexed tokenId,
        uint price,
        uint timeToEnd,
        address indexed seller
    );

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    fallback() external {}

    // Make item to offer on the marketplace
    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        // increment itemCount
        itemCount ++;
        // transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // add new item to items mapping
        items[itemCount] = Item (
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );
        // emit Offered event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");
        // pay seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        // update item to sold
        item.sold = true;
        // transfer nft to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        // emit Bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }
    function getTotalPrice(uint _itemId) view public returns(uint){
        return((items[_itemId].price*(100 + feePercent))/100);
    }

    function startAuction(IERC721 _nft, uint _tokenId, uint _price, uint _timeToEnd) external nonReentrant {
        require(_price > 0, "price should be greater than zero");
        auctionItemCount ++;
        // transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // add new item to items mapping
        auctionItems[auctionItemCount] = AuctionItem (
            auctionItemCount,
            _nft,
            _tokenId,
            _price,
            _timeToEnd,
            payable(msg.sender),
            payable(msg.sender),
            0,
            false
        );
        emit AuctionStarted(
            auctionItemCount,
            address(_nft),
            _tokenId,
            _price,
            _timeToEnd,
            msg.sender
        );
    }

    function makeOffer(uint _auctionId) external payable nonReentrant {
        require(_auctionId > 0, "Auction id should be bigger than zero.");
        require(msg.value > auctionItems[_auctionId].price, "Price should be greater than current price.");
        require(block.timestamp < auctionItems[_auctionId].timeToEnd, "Auction should not be ended.");
        console.log(_auctionId, msg.value, auctionItems[_auctionId].price);
        // Pay previous winner
        if (auctionItems[_auctionId].deposited > 0) {
            payable(auctionItems[_auctionId].winner).transfer(auctionItems[_auctionId].deposited);
        }
        // Update auction item
        AuctionItem storage auctionItem = auctionItems[_auctionId];
        auctionItem.price = msg.value;
        auctionItem.winner = payable(msg.sender);
        auctionItem.deposited = msg.value;
        // TODO Emit event

    }

    function claimNFT(uint _auctionId) external nonReentrant {
        require(_auctionId > 0, "Auction id should be bigger than zero");
        require(block.timestamp >= auctionItems[_auctionId].timeToEnd, "Auction should end first.");
        require(auctionItems[_auctionId].winner == msg.sender || auctionItems[_auctionId].seller == msg.sender, "Only winner or seller can run this function.");
        require(!auctionItems[_auctionId].claimed, "NFT is already claimed.");
        // Transfer NFT to msg.sender
        auctionItems[_auctionId].nft.transferFrom(address(this), auctionItems[_auctionId].winner, auctionItems[_auctionId].tokenId);
        if (auctionItems[_auctionId].deposited > 0) {
            payable(auctionItems[_auctionId].seller).transfer(auctionItems[_auctionId].deposited);
        }
        // TODO: Check if two lines below are needed. (and how much gas it costs)
        AuctionItem storage auctionItem = auctionItems[_auctionId];
        auctionItem.claimed = true;
    }
}
