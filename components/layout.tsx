import Header from './header';
import Footer from './footer';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Layout({ children, className }: Props) {
  return (
    <>
      <Header />
      <main className={`mt-20 mb-10 ${className}`}>{children}</main>
      <Footer />
    </>
  );
}
