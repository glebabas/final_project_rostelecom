import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { NFTCollection, NFTMarketplace } from "../typechain-types";

describe("NFT Marketplace", function () {
  let nftCollection: NFTCollection;
  let nftMarketplace: NFTMarketplace;
  let owner: HardhatEthersSigner;

  beforeEach(async function () {
    // Получаем тестовые аккаунты
    [owner] = await ethers.getSigners();

    // Деплоим контракты
    const NFTCollectionFactory = await ethers.getContractFactory("NFTCollection");
    nftCollection = (await NFTCollectionFactory.deploy()) as unknown as NFTCollection;
    await nftCollection.waitForDeployment();

    const NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = (await NFTMarketplaceFactory.deploy()) as unknown as NFTMarketplace;
    await nftMarketplace.waitForDeployment();
  });

  describe("NFT Collection", function () {
    it("Should create a new token", async function () {
      const tx = await nftCollection.createToken("https://example.com/token/1");
      await tx.wait();
      const ownerAddress = await owner.getAddress();
      expect(await nftCollection.ownerOf(1)).to.equal(ownerAddress);
    });
  });

  describe("NFT Marketplace", function () {
    it("Should create market item", async function () {
      // Создаем токен
      const tx1 = await nftCollection.createToken("https://example.com/token/1");
      await tx1.wait();

      // Получаем адрес маркетплейса
      const marketplaceAddress = await nftMarketplace.getAddress();

      // Апрувим маркетплейс для работы с токеном
      await nftCollection.approve(marketplaceAddress, 1);

      // Создаем маркет айтем
      const listingPrice = await nftMarketplace.getListingPrice();
      const auctionPrice = ethers.parseEther("1");

      await expect(
        nftMarketplace.createMarketItem(await nftCollection.getAddress(), 1, auctionPrice, { value: listingPrice }),
      ).to.emit(nftMarketplace, "MarketItemCreated");
    });
  });
});
