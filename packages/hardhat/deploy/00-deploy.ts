import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy NFTCollection
  const nftCollection = await deploy("NFTCollection", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`NFTCollection deployed at: ${nftCollection.address}`);
  // Deploy NFTMarketplace
  const nftMarketplace = await deploy("NFTMarketplace", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log(`NFTMarketplace deployed at: ${nftMarketplace.address}`);

  // Verify contracts if on network that supports it
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: nftCollection.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: nftMarketplace.address,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Error verifying contracts:", error);
    }
  }
};

export default deployContracts;

deployContracts.tags = ["NFTCollection", "NFTMarketplace"];
