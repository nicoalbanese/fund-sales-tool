import { createGlobalStyle, ThemeProvider } from "styled-components";

const GlobalStyle = createGlobalStyle`
html, body {
	margin: 0;
	font-family: sans-serif;
  background: ${({ theme }) => theme.colors.background};
}

*,
*:before,
*:after {
  box-sizing: border-box;
}

h1, h2, h3, h4, h5, p {
	margin: 0;
}
`;

const theme = {
  colors: {
    primary: "#fff",
    background: "#202937",
  },
};

export default function App({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle theme={theme} />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
