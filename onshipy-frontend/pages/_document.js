import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#050509" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}