// import { Inter } from "next/font/google";
// import "./globals.css";
// import SessionProvider from "@/utils/SessionProvider";
// import { getServerSession } from "next-auth";
// const inter = Inter({ subsets: ["latin"] });
// export const metadata = {
//   title: "AS Code Elevate",
//   description: "AS Code Elevate.",
//   icons: {
//     icon: "/img/logo.png",
//   },
// };
// export default async function RootLayout({ children }) {
//   const session = await getServerSession();
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <SessionProvider session={session}>{children}</SessionProvider>
//       </body>
//     </html>
//   );
// }

import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/utils/SessionProvider";
import { getServerSession } from "next-auth";
import Head from "next/head"; // Import Head component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AS Code Elevate",
  description: "AS Code Elevate.",
  icons: {
    icon: "/img/logo.png",
  },
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <Head>
        {/* Viewport meta tag to disable zoom */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <body className={inter.className}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
