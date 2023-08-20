// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'divib',
  tagline: '595930911@qq.com',
  url: 'https://divib-cc.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'divib-cc', // Usually your GitHub org/user name.
  projectName: 'divib-cc.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages', // GitHub分支名
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/divib-cc/divib-cc.github.io/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/divib-cc/divib-cc.github.io/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'divib的网站',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          { type: 'doc', docId: 'index', position: 'left', label: '文档', },
          { to: '/blog', label: '博客', position: 'left' },
          {
            href: 'https://github.com/divib-cc',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '导航',
            items: [
              {
                label: '文档',
                to: '/docs',
              },
              {
                label: '博客',
                to: '/blog',
              },
            ],
          },
          {
            title: '社区',
            items: [
              {
                label: 'B站',
                href: 'https://space.bilibili.com/14497092',
              },
            ],
          },
          {
            title: '更多',
            items: [

              {
                label: 'GitHub',
                href: 'https://github.com/divib-cc',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} divib Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
