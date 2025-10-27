import type { PropsWithChildren } from "react";
import Header from "../Header/Header";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
