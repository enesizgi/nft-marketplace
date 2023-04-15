// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IERC20Permit.sol";
import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard {

    // Variables
    address payable public immutable feeAccount; // the account that receives fees
    uint public immutable feePercent; // the fee percentage on sales
    uint public itemCount;
    uint public auctionItemCount;
    uint public activeListedItemCount;
    uint public activeAuctionItemCount;
    uint[] public activeListedItemIds;
    uint[] public activeAuctionItemIds;
    // TODO @Enes: We need to keep the current items at the state offered/auctionStarted for frontend.

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
        bool canceled;
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
        bool canceled;
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

    event AuctionEnded(
        uint auctionId,
        address nft,
        uint indexed tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    event OfferCanceled(
        uint itemId
    );

    event AuctionCanceled(
        uint auctionId
    );

    event BidPlaced(
        uint auctionId,
        address bidder,
        uint amount
    );

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    fallback() external {}

    function getActiveListedItemIds(uint _startFrom) view public returns(uint[] memory) {
        uint[] memory ids = new uint[](5);
        uint counter = 0;
        for (uint i = _startFrom; i >= 0; i--) {
            if (activeListedItemIds[i] == 0) continue;
            ids[counter] = activeListedItemIds[i];
            counter++;
            if (counter == 5) return ids;
        }
        return ids;
    }

    // Make item to offer on the marketplace
    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        // increment itemCount
        itemCount ++;
        activeListedItemCount ++;
        activeListedItemIds.push(itemCount);
        // transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // add new item to items mapping
        items[itemCount] = Item (
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false,
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
        require(!item.sold && !item.canceled, "item already sold or canceled");
        // pay seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        // update item to sold
        item.sold = true;
        // transfer nft to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        activeListedItemCount --;
        delete activeListedItemIds[_itemId - 1];
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
        activeAuctionItemCount ++;
        activeAuctionItemIds.push(auctionItemCount);
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
            false,
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

        emit BidPlaced(
            _auctionId,
            msg.sender,
            msg.value
        );
    }

    function claimNFT(uint _auctionId) external nonReentrant {
        require(_auctionId > 0, "Auction id should be bigger than zero");
        require(block.timestamp >= auctionItems[_auctionId].timeToEnd, "Auction should end first.");
        require(auctionItems[_auctionId].winner == msg.sender || auctionItems[_auctionId].seller == msg.sender, "Only winner or seller can run this function.");
        require(!auctionItems[_auctionId].claimed, "NFT is already claimed.");

        AuctionItem memory item = auctionItems[_auctionId];
        // Transfer NFT to msg.sender
        item.nft.transferFrom(address(this), item.winner, item.tokenId);
        if (item.deposited > 0) {
            payable(item.seller).transfer(item.deposited);
        }
        // TODO: Check if two lines below are needed. (and how much gas it costs)
        AuctionItem storage auctionItem = auctionItems[_auctionId];
        auctionItem.claimed = true;
        activeAuctionItemCount --;
        delete activeAuctionItemIds[_auctionId - 1];

        emit AuctionEnded(
            _auctionId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            item.winner
        );
    }

    function cancelOffered(uint _itemId) external nonReentrant {
        require(_itemId > 0, "Item id should be bigger than zero.");
        require(items[_itemId].seller == msg.sender, "Only seller can cancel this item.");
        require(!items[_itemId].sold, "Item is already sold.");

        Item storage item = items[_itemId];
        item.canceled = true;
        // Transfer NFT back to seller
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        // Delete item from items mapping

        activeListedItemCount --;
        delete activeListedItemIds[_itemId - 1];
        // TODO @Enes: Replace this event later. It will break our item activity in this way.
        emit OfferCanceled (
            _itemId
        );
    }

    function cancelAuction(uint _auctionId) external payable nonReentrant {
        require(_auctionId > 0, "Auction id should be bigger than zero.");
        require(auctionItems[_auctionId].seller == msg.sender, "Only seller can cancel this auction.");
        require(!auctionItems[_auctionId].claimed, "Auction is already claimed.");
        require(block.timestamp < auctionItems[_auctionId].timeToEnd, "Auction should not be ended.");

        AuctionItem storage item = auctionItems[_auctionId];
        // Transfer NFT to msg.sender
        item.nft.transferFrom(address(this), item.seller, item.tokenId);
        if (item.deposited > 0) {
            payable(item.winner).transfer(item.deposited);
        }

        item.canceled = true;
        activeAuctionItemCount --;
        delete activeAuctionItemIds[_auctionId - 1];

        // TODO @Enes: Replace this event later. Item activity will break in this way.
        emit AuctionCanceled (
            _auctionId
        );
    }

    function acceptERCOffer(IERC20Permit erc20, IERC721 nft, uint256 _tokenId, uint _itemId, bool isOnSale, uint256 deadline,
        address offerer, uint256 amount, uint8 _v, bytes32 _r, bytes32 _s ) external nonReentrant {
        address owner = nft.ownerOf(_tokenId);
        require(block.timestamp < deadline, "Offer deadline is exceeded");
        require(address(this) == owner , "Only marketplace items can be accepted");
        require(erc20.balanceOf(offerer) > amount, "Offerer does not have enough wETH");
        erc20.permit(offerer, address(this), amount, deadline, _v, _r, _s);
        erc20.transferFrom(offerer, msg.sender, amount);
        nft.transferFrom(address(this), offerer, _tokenId);
        if (isOnSale) {
            Item storage item = items[_itemId];
            item.sold = true;
            // emit Bought event
            emit Bought(
                _itemId,
                address(item.nft),
                item.tokenId,
                amount,
                item.seller,
                offerer
            );
        } else {
            AuctionItem storage item = auctionItems[_itemId];
            item.claimed = true;

            emit AuctionEnded(
                _itemId,
                address(item.nft),
                item.tokenId,
                uint(amount),
                item.seller,
                offerer
            );
        }
    }
}
