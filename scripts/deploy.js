import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AxonRegistry to target network...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const AxonRegistry = await ethers.getContractFactory("AxonRegistry");
  const registry = await AxonRegistry.deploy(deployer.address);

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("AxonRegistry deployed successfully to:", address);
  console.log("Root Admin & Issuer Role granted to:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

