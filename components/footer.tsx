import packageJSON from '../package.json';
import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className="w-full py-4 bg-white md:flex md:items-center md:justify-between md:py-6 dark:bg-gray-800 dark:border-gray-600">
      <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
        Made by{' '}
        <a
          href="https://emasuriano.com/"
          className="text-white hover:underline"
        >
          Ema Suriano
        </a>
      </span>
      <ul className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
        <li>
          <a
            href="https://github.com/EmaSuriano/github-oss-dashboard"
            className="hover:underline"
          >
            Github Repository
          </a>
        </li>
      </ul>
    </footer>
  );
}
