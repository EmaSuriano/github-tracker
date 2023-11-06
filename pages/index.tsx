import { GetServerSidePropsContext } from 'next';
import { getSession, signIn } from 'next-auth/react';
import { FAQ } from '../components/sections/faq';
import { Features } from '../components/sections/features';
import Layout from '../components/layout';

const QUESTIONS = [
  {
    title: `What do you mean by "Figma assets"?`,
    answer: `You will have access to download the full Figma project including
        all of the pages, the components, responsive pages, and also the
        icons, illustrations, and images included in the screens.`,
  },
];

const ARROW_ICON = (
  <svg
    className="w-4 h-4 ml-1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    ></path>
  </svg>
);

const BULB_ICON = (
  <svg
    className="w-4 h-4 ml-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    ></path>
  </svg>
);

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSession(ctx);

  if (session) {
    return {
      redirect: { destination: '/dashboard', permanent: false },
    };
  }
  return { props: {} };
}

export default function IndexPage() {
  return (
    <Layout className="px-12">
      <section className="mx-auto max-w-7xl">
        <div className="w-full mx-auto text-left md:w-11/12 xl:w-9/12 md:text-center">
          <h1 className="mb-8 text-4xl font-extrabold leading-none tracking-normal dark:text-white text-gray-900 md:text-6xl md:tracking-tight">
            <span>Your</span>{' '}
            <span className="block w-full py-2 text-transparent bg-clip-text leading-12 bg-gradient-to-r from-green-400 to-purple-500 lg:inline">
              GitHub
            </span>{' '}
            <span>Snapshot in Seconds</span>
          </h1>
          <p className="px-0 mb-8 text-lg text-gray-600 dark:text-gray-400 md:text-xl lg:px-24">
            Get actionable GitHub repository real-time data with a simple Sign
            in. Connected with GitHub Gist.
          </p>
          <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
            <a
              href={`/api/auth/signin`}
              onClick={(e) => {
                e.preventDefault();
                signIn();
              }}
              className="inline-flex items-center justify-center w-full px-6 py-3 mb-2 text-lg text-white bg-primary-400 dark:bg-primary-600 hover:bg-primary-500 rounded-2xl sm:w-auto sm:mb-0"
            >
              Get Started
              {ARROW_ICON}
            </a>
            <a
              href="#learn-more"
              className="inline-flex items-center justify-center w-full px-6 py-3 mb-2 text-lg bg-gray-100 dark:bg-gray-400 rounded-2xl sm:w-auto sm:mb-0"
            >
              Learn More
              {BULB_ICON}
            </a>
          </div>
        </div>
      </section>
      <section className="w-full mx-auto mt-20 text-center md:w-10/12">
        <div className="relative z-0 w-full mt-8">
          <div className="relative overflow-hidden shadow-2xl">
            <div className="flex items-center flex-none px-4 bg-green-400 rounded-b-none h-11 rounded-xl">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                <div className="w-3 h-3 border-2 border-white rounded-full"></div>
              </div>
            </div>
            <img src="https://cdn.devdojo.com/images/march2021/green-dashboard.jpg" />
          </div>
        </div>
      </section>
      <div id="learn-more" />
      <Features />
      <FAQ questions={QUESTIONS} />
    </Layout>
  );
}
