const { ethers, network } = require("hardhat");
import { amoy, propertyData } from "../constants";
import { verifyContract as verify } from "./verify/contract";

async function main() {
  console.log(`Deploying RWAToken to ${network.name}`);

  const signers = await ethers.getSigners();
  const owner = signers[0].address;

  const args = [
    "RWAToken",
    "RWA",
    "Real World Asset backed Token",
    propertyData.address,
    propertyData.valuation_usd,
    propertyData.size_sqm,
    propertyData.default_risk_score,
    propertyData.location_score,
    owner,
    ethers.utils.getAddress(amoy.endpoint),
    owner,
  ];

  const rwaToken = await ethers.getContractFactory("RWAToken");
  const deployedToken = await rwaToken.deploy(...args);
  await deployedToken.deployed();

  console.log(`RWAToken deployed to: ${deployedToken.address}`);

  console.log("Setting peers...");

  // Set peers for both Base Sepolia and Ethereum Sepolia
  const baseEndpointId = 40245; // Base Sepolia
  const ethEndpointId = 40161; // Ethereum Sepolia

  // Note: Replace these addresses with actual deployed contract addresses
  const baseContractAddress = "0x0000000000000000000000000000000000000000"; // Replace with deployed Base address
  const ethContractAddress = "0x0000000000000000000000000000000000000000"; // Replace with deployed Ethereum address

  if (baseContractAddress !== "0x0000000000000000000000000000000000000000") {
    await deployedToken.setPeer(
      baseEndpointId,
      ethers.utils.zeroPadValue(
        ethers.utils.getAddress(baseContractAddress),
        32
      )
    );
    console.log("Base Sepolia peer set.");
  }

  if (ethContractAddress !== "0x0000000000000000000000000000000000000000") {
    await deployedToken.setPeer(
      ethEndpointId,
      ethers.utils.zeroPadValue(ethers.utils.getAddress(ethContractAddress), 32)
    );
    console.log("Ethereum Sepolia peer set.");
  }

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Verifying contract...");
    await verify(deployedToken.address, args);
    console.log("Contract verified");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
