import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import abi from "../contracts/CocoCoin.json";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormGroup,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const contractAdress = "0xe0a56d0355e99ef281b28371bc3a1c967346d7d6";
  const contractAbi = abi.abi;

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userWallet, setUserWallet] = useState<string|null>(null);
  const [ownerWallet, setOwnerWallet] = useState<string|null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState({
    wallet: "",
    transferAmount: "",
    burnAmount: "",
    mintAmount: "",
  });

  const checkIsWalletConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const account = accounts[0];

        setUserWallet(account);
        setIsWalletConnected(true);
        console.log("Account Connected: ", account);
      } else {
        setError(
          "Could not find Metamask extension. Please install it and try again"
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenInfo = async () => {
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAdress, contractAbi, signer);

        const tokenName = await contract.name();
        const tokenSymbol = await contract.symbol();
        const tokenOwner = await contract.owner();
        const tokenSupply = await contract.totalSupply();
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setOwnerWallet(tokenOwner);
        setTokenName(tokenName);
        setTokenSymbol(tokenSymbol);
        setTokenSupply(formatEther(tokenSupply));

        if (account.toLowerCase() === tokenOwner.toLowerCase())
          setIsOwner(true);
      } else {
        setError(
          "Could not find Metamask extension. Please install it and try again"
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const transferTokens = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAdress, contractAbi, signer);

        const txn = await contract.transfer(
          inputValue.wallet,
          parseEther(inputValue.transferAmount)
        );

        await txn.wait();

        getTokenInfo();
      } else {
        setError(
          "Could not find Metamask extension. Please install it and try again"
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintTokens = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAdress, contractAbi, signer);

        const txn = await contract.mint(
          ownerWallet,
          parseEther(inputValue.mintAmount)
        );
        await txn.wait();
        getTokenInfo();
      } else {
        setError(
          "Could not find Metamask extension. Please install it and try again"
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const burnTokens = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAdress, contractAbi, signer);

        const txn = await contract.burn(parseEther(inputValue.burnAmount));

        await txn.wait();

        getTokenInfo();
      } else {
        setError(
          "Could not find Metamask extension. Please install it and try again"
        );
        console.log("Metamask not found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInputValue((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    checkIsWalletConnected();
    getTokenInfo();
  }, [isWalletConnected]);
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 1,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: {
            xs: "100%",
            md: "800px",
          },
          display: "flex",
          flexDirection: "column",
          p: {
            xs: 1,
            md: 3,
          },
        }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h4">
            Welcome to {tokenName || "CocoCoin"}
          </Typography>
          <Divider dir="horizontal" flexItem />
          {!isWalletConnected && (
            <Typography variant={isSmallScreen ? "body2" : "body1"}>
              In order to use this app, you must connect with Metamask
            </Typography>
          )}

          {isWalletConnected && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant={isSmallScreen ? "body2" : "body1"}>
                <span style={{ fontWeight: "bold" }}>Coin: </span>
                {`${tokenName} 🥥`}
              </Typography>
              <Typography variant={isSmallScreen ? "body2" : "body1"}>
                <span style={{ fontWeight: "bold" }}>Tiker: </span>
                {`${tokenSymbol}`}
              </Typography>
              <Typography variant={isSmallScreen ? "body2" : "body1"}>
                <span style={{ fontWeight: "bold" }}>Total supply: </span>
                {`${tokenSupply}`}
              </Typography>
            </Box>
          )}
          <Divider flexItem />
          {isWalletConnected && (
            <Box
              component={"form"}
              onSubmit={transferTokens}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <FormGroup sx={{ gap: "2px" }}>
                <TextField
                  variant="filled"
                  label="Wallet addres"
                  placeholder={"0x".padEnd(42, "0")}
                  onChange={handleInputchange}
                  name="wallet"
                  value={inputValue.wallet}
                />
                <TextField
                  variant="filled"
                  label={`${tokenSymbol} amount`}
                  placeholder={"0.0"}
                  onChange={handleInputchange}
                  name="transferAmount"
                  value={inputValue.transferAmount}
                />
                <Button type="submit" variant="contained" disabled={
                  inputValue.wallet.length!==42 ||Number(inputValue.transferAmount)<=0||inputValue.wallet.toLowerCase()===ownerWallet?.toLowerCase()
                }>
                  Transfer
                </Button>
              </FormGroup>
            </Box>
          )}
          {isOwner && (
            <Box
              component={"form"}
              onSubmit={burnTokens}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <FormGroup sx={{ gap: "2px" }}>
                <TextField
                  variant="filled"
                  label="Burn tokens"
                  placeholder={"0.0"}
                  onChange={handleInputchange}
                  name="burnAmount"
                  value={inputValue.burnAmount}
                />

                <Button type="submit" variant="contained"
                
                disabled={Number(inputValue.burnAmount)<=0}
                >
                  Burn
                </Button>
              </FormGroup>
            </Box>
          )}
          {isOwner && (
            <Box
              component={"form"}
              onSubmit={mintTokens}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <FormGroup sx={{ gap: "2px" }}>
                <TextField
                  variant="filled"
                  label="Mint tokens"
                  placeholder={"0.0"}
                  onChange={handleInputchange}
                  name="mintAmount"
                  value={inputValue.mintAmount}
                />

                <Button type="submit" variant="contained" disabled={Number(inputValue.mintAmount)<=0}>
                  Mint
                </Button>
              </FormGroup>
            </Box>
          )}

          <Typography variant={isSmallScreen ? "body2" : "body1"}>
            <span style={{ fontWeight: "bold" }}>Contract Adress:</span>{" "}
            {contractAdress}
          </Typography>
          <Typography variant={isSmallScreen ? "body2" : "body1"}>
            <span style={{ fontWeight: "bold" }}>Your wallet adress:</span>{" "}
            {userWallet}
          </Typography>
          <Typography variant={isSmallScreen ? "body2" : "body1"}>
            <span style={{ fontWeight: "bold" }}>
              Token owner wallet adress:{" "}
            </span>
            {ownerWallet}
          </Typography>
          <Button
            variant="contained"
            sx={{ width: "fit-content" }}
            onClick={() => checkIsWalletConnected()}
          >
            {isWalletConnected
              ? "Metamask connected 🦊"
              : "Connect with Metamask 🔑"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
