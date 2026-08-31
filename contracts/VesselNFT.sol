// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract VesselNFT is ERC721, ERC2981, Ownable2Step, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 3232;
    uint96 public constant ROYALTY_FEE_NUMERATOR = 500; // 5% with ERC-2981's 10,000 denominator.

    uint256 public mintPrice;
    uint256 public maxPerTx;
    uint256 public maxPerWallet;
    uint256 private _nextTokenId = 1;

    bool public publicMintActive;
    bool public summoningStarted;
    bool public revealed;

    string public sealedURI;
    string public revealedBaseURI;
    bytes32 public provenanceHash;

    mapping(address wallet => uint256 quantity) public mintedByWallet;

    error MintInactive();
    error InvalidQuantity();
    error PerTransactionLimit();
    error WalletLimit();
    error SupplyExceeded();
    error IncorrectPayment();
    error ConfigLocked();
    error InvalidConfig();
    error AssemblyIncomplete();
    error AlreadyRevealed();
    error ProvenanceRequired();
    error ProvenanceAlreadyCommitted();
    error EmptyURI();
    error ZeroAddress();
    error WithdrawFailed();

    event MintConfigUpdated(uint256 mintPrice, uint256 maxPerTx, uint256 maxPerWallet);
    event SummoningStarted();
    event PublicMintStateChanged(bool active);
    event ProvenanceCommitted(bytes32 provenanceHash);
    event Revealed(string baseURI);
    event Withdrawal(address indexed recipient, uint256 amount);

    constructor(
        address initialOwner,
        uint256 initialMintPrice,
        uint256 initialMaxPerTx,
        uint256 initialMaxPerWallet,
        string memory initialSealedURI
    ) ERC721("NULL RITE VESSELS", "VESSEL") Ownable(initialOwner) {
        _validateMintConfig(initialMaxPerTx, initialMaxPerWallet);
        if (bytes(initialSealedURI).length == 0) revert EmptyURI();

        mintPrice = initialMintPrice;
        maxPerTx = initialMaxPerTx;
        maxPerWallet = initialMaxPerWallet;
        sealedURI = initialSealedURI;
        _setDefaultRoyalty(initialOwner, ROYALTY_FEE_NUMERATOR);
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    function remainingSupply() external view returns (uint256) {
        return _maxSupply() - totalSupply();
    }

    function configureMint(
        uint256 newMintPrice,
        uint256 newMaxPerTx,
        uint256 newMaxPerWallet
    ) external onlyOwner {
        if (summoningStarted) revert ConfigLocked();
        _validateMintConfig(newMaxPerTx, newMaxPerWallet);

        mintPrice = newMintPrice;
        maxPerTx = newMaxPerTx;
        maxPerWallet = newMaxPerWallet;

        emit MintConfigUpdated(newMintPrice, newMaxPerTx, newMaxPerWallet);
    }

    function setSealedURI(string calldata newSealedURI) external onlyOwner {
        if (summoningStarted) revert ConfigLocked();
        if (bytes(newSealedURI).length == 0) revert EmptyURI();
        sealedURI = newSealedURI;
    }

    function setPublicMintActive(bool active) external onlyOwner {
        if (active) {
            if (revealed || totalSupply() >= _maxSupply()) revert SupplyExceeded();
            if (!summoningStarted) {
                summoningStarted = true;
                emit SummoningStarted();
            }
        }

        publicMintActive = active;
        emit PublicMintStateChanged(active);
    }

    function mint(uint256 quantity) external payable nonReentrant {
        if (!publicMintActive) revert MintInactive();
        if (quantity == 0) revert InvalidQuantity();
        if (quantity > maxPerTx) revert PerTransactionLimit();
        if (mintedByWallet[msg.sender] + quantity > maxPerWallet) revert WalletLimit();
        if (totalSupply() + quantity > _maxSupply()) revert SupplyExceeded();
        if (msg.value != mintPrice * quantity) revert IncorrectPayment();

        mintedByWallet[msg.sender] += quantity;

        for (uint256 i = 0; i < quantity; ++i) {
            uint256 tokenId = _nextTokenId;
            unchecked {
                _nextTokenId = tokenId + 1;
            }
            _safeMint(msg.sender, tokenId);
        }

        if (totalSupply() == _maxSupply()) {
            publicMintActive = false;
            emit PublicMintStateChanged(false);
        }
    }

    function commitProvenance(bytes32 newProvenanceHash) external onlyOwner {
        if (revealed) revert AlreadyRevealed();
        if (totalSupply() != _maxSupply()) revert AssemblyIncomplete();
        if (newProvenanceHash == bytes32(0)) revert ProvenanceRequired();
        if (provenanceHash != bytes32(0)) revert ProvenanceAlreadyCommitted();

        provenanceHash = newProvenanceHash;
        emit ProvenanceCommitted(newProvenanceHash);
    }

    function reveal(string calldata finalBaseURI) external onlyOwner {
        if (revealed) revert AlreadyRevealed();
        if (totalSupply() != _maxSupply()) revert AssemblyIncomplete();
        if (provenanceHash == bytes32(0)) revert ProvenanceRequired();
        if (bytes(finalBaseURI).length == 0) revert EmptyURI();

        revealedBaseURI = finalBaseURI;
        revealed = true;
        publicMintActive = false;
        emit Revealed(finalBaseURI);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (!revealed) return sealedURI;
        return string.concat(revealedBaseURI, tokenId.toString(), ".json");
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function withdraw(address payable recipient) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert ZeroAddress();
        uint256 amount = address(this).balance;
        (bool ok, ) = recipient.call{value: amount}("");
        if (!ok) revert WithdrawFailed();
        emit Withdrawal(recipient, amount);
    }

    function _validateMintConfig(uint256 txLimit, uint256 walletLimit) internal pure {
        if (
            txLimit == 0 ||
            walletLimit == 0 ||
            txLimit > walletLimit ||
            walletLimit > MAX_SUPPLY
        ) revert InvalidConfig();
    }

    function _maxSupply() internal view virtual returns (uint256) {
        return MAX_SUPPLY;
    }
}
