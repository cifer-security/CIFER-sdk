// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CIFER SDK',
  tagline: 'Quantum-resistant encryption for blockchain applications',
  favicon: 'img/logo.png',

  // Set the production url of your site here
  url: 'https://sdk.cifer-security.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'cifer-network', // Usually your GitHub org/user name.
  projectName: 'cifer-sdk', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Edit URL for GitHub
          editUrl: 'https://github.com/cifer-security/cifer-sdk/tree/main/docs-site/',
          // Disable git-based last update time (not available in Vercel's build environment)
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
          // Breadcrumbs for navigation
          breadcrumbs: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Social card image
      image: 'img/cifer-social-card.jpg',
      navbar: {
        style: 'dark',
        title: 'CIFER SDK',
        logo: {
          alt: 'CIFER Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Documentation',
          },
          {
            to: '/docs/api',
            label: 'API Reference',
            position: 'left',
          },
          {
            href: 'https://github.com/cifer-security/cifer-sdk',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started/installation',
              },
              {
                label: 'Guides',
                to: '/docs/guides/key-management',
              },
              {
                label: 'API Reference',
                to: '/docs/api',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Twitter',
                href: 'https://twitter.com/cifernetwork',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/cifer-security/cifer-sdk',
              },
              {
                label: 'npm',
                href: 'https://www.npmjs.com/package/cifer-sdk',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CIFER Network. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'json', 'typescript', 'solidity'],
      },
      // Algolia search (configure with your own credentials)
      // algolia: {
      //   appId: 'YOUR_APP_ID',
      //   apiKey: 'YOUR_API_KEY',
      //   indexName: 'cifer-sdk',
      //   contextualSearch: true,
      // },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      // Announcement bar
      announcementBar: {
        id: 'beta_notice',
        content:
          '🚧 This SDK is in beta. API may change. Please report issues on GitHub.',
        backgroundColor: '#18181b',
        textColor: '#f4f4f5',
        isCloseable: true,
      },
    }),

  // Add TypeScript support for MDX
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
};

module.exports = config;
