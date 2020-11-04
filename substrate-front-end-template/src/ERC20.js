import { Abi, ContractPromise } from "@polkadot/api-contract";
import contractMetadata from "./config/ERC20-metadata.json";

// Set the ABI from the complied erc20 ink! contact. 
// This is copied over from the build directory (../../erc20/target/)
const abi = new Abi(contractMetadata);

// This is the address of a DEPLOYED instance of the uploaded contract
// BE SURE TO EDIT THIS HASH TO WHAT IS ON CHAIN!!! 
const addr = '5GDk7kV6zWq8N8i8xi3BmHxvbaNw6t4YvASghsLf1wCu9W2C';

export default function ERC20(api) {
  return new ContractPromise(api, abi, addr);
}