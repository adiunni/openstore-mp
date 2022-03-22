// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // security for non-reentrant
import "./NFT.sol";
import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds; // Id for each individual item
    Counters.Counter private _itemsSold; // Number of items sold

    // Currency is in Matic (lower price than ethereum)
    address payable owner; // The owner of the NFTMarket contract (transfer and send function availabe to payable addresses)
    uint256 listingPrice = 0.00001 ether; // This is made for owner of the file to be comissioned

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        // Contents of a market item.
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable creator;
        address payable seller;
        address payable owner;
        string category;
        uint256 price;
        bool isSold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem; // This is not public.

    // Event is an inhertable contract that can be used to emit events
    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address creator,
        address seller,
        address owner,
        string category,
        uint256 price,
        bool isSold
    );

    // Resale function update.

    event ProductUpdated(
        uint256 indexed itemId,
        uint256 indexed oldPrice,
        uint256 indexed newPrice
    );

    event MarketItemDeleted(uint256 itemId);

    event ProductSold(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address creator,
        address seller,
        address owner,
        uint256 price
    );

    event ProductListed(uint256 indexed itemId);

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    modifier onlyProductOrMarketplaceOwner(uint256 id) {
        if (idToMarketItem[id].owner != address(0)) {
            require(idToMarketItem[id].owner == msg.sender);
        } else {
            require(
                idToMarketItem[id].seller == msg.sender || msg.sender == owner
            );
        }
        _;
    }

    modifier onlyProductSeller(uint256 id) {
        require(
            idToMarketItem[id].owner == address(0) &&
                idToMarketItem[id].seller == msg.sender,
            "Only the product can do this operation"
        );
        _;
    }

    modifier onlyItemOwner(uint256 id) {
        require(
            idToMarketItem[id].owner == msg.sender,
            "Only product owner can do this operation"
        );
        _;
    }

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        string calldata category
    ) public payable nonReentrant {
        require(price > 0, "No item for free here");
        require(
            msg.value == listingPrice,
            "Price must be same as listing price"
        );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender), // Creator.
            payable(msg.sender), // First seller.
            payable(address(0)), // No owner for the item
            category,
            price,
            false
        );
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            msg.sender,
            address(0),
            category,
            price,
            false
        );
    }

    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.value == price,
            "Please make the price to be same as listing price"
        );

        idToMarketItem[itemId].seller.transfer(msg.value); // Transfer the money to seller.
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].isSold = true;
        idToMarketItem[itemId].owner = payable(msg.sender);
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);

        emit ProductSold(
            itemId,
            nftContract,
            tokenId,
            idToMarketItem[itemId].creator,
            idToMarketItem[itemId].seller,
            payable(msg.sender),
            price
        );
    }

    function getMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory marketItems = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                marketItems[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return marketItems;
    }

    function fetchPurchasedNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory marketItems = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                marketItems[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return marketItems;
    }

    function fetchSingleItem(uint256 id)
        public
        view
        returns (MarketItem memory)
    {
        return idToMarketItem[id];
    }

    function fetchCreateNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1; // No dynamic length. Predefined length has to be made
            }
        }

        MarketItem[] memory marketItems = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].creator == msg.sender) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                marketItems[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return marketItems;
    }

    function putItemToResell(
        address nftContract,
        uint256 itemId,
        uint256 newPrice
    ) public payable nonReentrant onlyItemOwner(itemId) {
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(newPrice > 0, "No item for free here");
        require(
            msg.value == listingPrice,
            "Price must be same as listing price"
        );
        NFT tokenContract = NFT(nftContract);
        tokenContract.transferToken(msg.sender, address(this), tokenId);
        idToMarketItem[itemId].owner = payable(address(0));
        idToMarketItem[itemId].price = newPrice;
        idToMarketItem[itemId].isSold = false;
        idToMarketItem[itemId].seller = payable(msg.sender);
        _itemsSold.decrement();

        emit ProductListed(itemId);
    }

    function getItemsByCategory(string calldata category)
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                keccak256(abi.encodePacked(idToMarketItem[i + 1].category)) ==
                keccak256(abi.encodePacked(category)) &&
                idToMarketItem[i + 1].owner == address(0)
            ) {
                itemCount += 1;
            }
        }

        MarketItem[] memory marketItems = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                keccak256(abi.encodePacked(idToMarketItem[i + 1].category)) ==
                keccak256(abi.encodePacked(category)) &&
                idToMarketItem[i + 1].owner == address(0)
            ) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                marketItems[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return marketItems;
    }
}
