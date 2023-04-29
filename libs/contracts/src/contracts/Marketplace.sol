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
        (bool successSeller, ) = item.seller.call{value: item.price}("");
        require(successSeller, "failed to send Ether to seller");
        (bool successFeeAccount, ) = feeAccount.call{value: _totalPrice - item.price}("");
        require(successFeeAccount, "failed to send Ether to feeAccount");
        // update item to sold
        item.sold = true;
        // transfer nft to buyer
        item.nft.safeTransferFrom(address(this), msg.sender, item.tokenId);
        // emit Bought event
        emit Bought(_itemId, address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
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
        AuctionItem storage auctionItem = auctionItems[_auctionId];
        require(msg.value > auctionItem.price, "Price should be greater than current price.");
        require(block.timestamp < auctionItem.timeToEnd, "Auction should not be ended.");
        uint previousDeposit = auctionItem.deposited;
        address payable previousWinner = auctionItem.winner;
        auctionItem.price = msg.value;
        auctionItem.winner = payable(msg.sender);
        auctionItem.deposited = msg.value;
        if (previousDeposit > 0) {
            previousWinner.transfer(previousDeposit);
        }
        emit BidPlaced(
            _auctionId,
            msg.sender,
            msg.value
        );
    }


    function claimNFT(uint _auctionId) external nonReentrant {
        require(_auctionId > 0, "Auction id should be bigger than zero");
        AuctionItem storage auctionItem = auctionItems[_auctionId];
        require(block.timestamp >= auctionItem.timeToEnd, "Auction should end first.");
        require(auctionItem.winner == msg.sender || auctionItem.seller == msg.sender, "Only winner or seller can run this function.");
        require(!auctionItem.claimed, "NFT is already claimed.");

        // Transfer NFT to winner and pay seller
        auctionItem.nft.transferFrom(address(this), auctionItem.winner, auctionItem.tokenId);
        if (auctionItem.deposited > 0) {
            auctionItem.seller.transfer(auctionItem.deposited);
        }
        // Mark auction item as claimed
        auctionItem.claimed = true;

        emit AuctionEnded(
            _auctionId,
            address(auctionItem.nft),
            auctionItem.tokenId,
            auctionItem.price,
            auctionItem.seller,
            auctionItem.winner
        );
    }


    function cancelOffered(uint _itemId) external nonReentrant {
        require(_itemId > 0, "Item id should be bigger than zero.");
        Item storage item = items[_itemId];
        require(item.seller == msg.sender, "Only seller can cancel this item.");
        require(!item.sold, "Item is already sold.");
        item.canceled = true;
        // Transfer NFT back to seller
        item.nft.safeTransferFrom(address(this), msg.sender, item.tokenId);
        // Delete item from items mapping
        emit OfferCanceled(_itemId);
    }


    function cancelAuction(uint _auctionId) external nonReentrant {
        require(_auctionId > 0, "Auction id should be bigger than zero.");
        AuctionItem storage item = auctionItems[_auctionId];
        require(item.seller == msg.sender, "Only seller can cancel this auction.");
        require(!item.claimed, "Auction is already claimed.");
        require(block.timestamp < item.timeToEnd, "Auction should not be ended.");

        if (item.deposited > 0) {
            payable(item.winner).transfer(item.deposited);
        }

        item.canceled = true;

        // Transfer NFT to seller
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit AuctionCanceled(_auctionId);
    }


    function acceptERCOffer(IERC20Permit erc20, IERC721 nft, uint256 _tokenId, uint _itemId, bool isOnSale, uint256 deadline,
        address offerer, uint256 amount, uint8 _v, bytes32 _r, bytes32 _s ) external nonReentrant {
        require(block.timestamp < deadline, "Offer deadline is exceeded");
        require(address(this) == nft.ownerOf(_tokenId) , "Only marketplace items can be accepted");
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
