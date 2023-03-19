import { Avatar, Button, Dropdown, Navbar } from 'flowbite-react';
import {
  SessionContextValue,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react';
import { notReachable } from '../helpers/notReachable';
import { useRouter } from 'next/router';

export default function Header() {
  return (
    <header>
      <Navbar fluid={true} rounded={true}>
        <Navbar.Brand href="/">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="mr-3 h-6 sm:h-9"
            alt="Flowbite Logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Flowbite
          </span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <NavbarLinks />
      </Navbar>
    </header>
  );
}

const NavbarLinks = () => {
  const router = useRouter();
  const session = useSession();

  switch (session.status) {
    case 'loading':
    case 'unauthenticated':
      return (
        <Navbar.Collapse>
          <Navbar.Link
            href="/auth/signin"
            onClick={(e) => {
              e.preventDefault();
              signIn();
            }}
          >
            Sign in
          </Navbar.Link>
        </Navbar.Collapse>
      );

    case 'authenticated':
      return (
        <Navbar.Collapse>
          <Navbar.Link
            href="/dashboard"
            active={router.pathname === '/dashboard'}
          >
            Dashboard
          </Navbar.Link>
          <Navbar.Link
            href="/api/auth/signout"
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
          >
            Sign out
          </Navbar.Link>
        </Navbar.Collapse>
      );

    default:
      return notReachable(session);
  }
};
