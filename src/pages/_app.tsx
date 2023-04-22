import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider, createTheme } from "@mui/material";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>CocoCoin🥥</title>
      </Head>
      <ThemeProvider
        theme={createTheme({
          palette: {
            mode: "dark",
          },
        })}
      >
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
