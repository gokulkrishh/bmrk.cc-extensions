import { defineManifest } from '@crxjs/vite-plugin';

import packageJson from './package.json';

const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/);

export default defineManifest(async () => ({
  manifest_version: 3,
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}`,
  // semver is OK in "version_name"
  version_name: version,
  name: 'Bookmark It.',
  short_name: 'bmrk it.',
  description:
    'Bookmark It. is an open-source bookmark manager to organize, discover and personalize your bookmarking experience.',
  permissions: ['activeTab', 'contextMenus', 'tabs', 'identity', 'storage'],
  oauth2: {
    client_id:
      '531625309515-s757u5or54n1iqrjtuuh3m7hutb8n0de.apps.googleusercontent.com',
    scopes: ['email', 'profile'],
  },
  action: {
    default_title: 'Bookmark It.',
    default_popup: 'index.html',
    default_icon: {
      '16': 'icon16.png',
      '32': 'icon32.png',
      '48': 'icon48.png',
      '128': 'icon128.png',
    },
  },
  externally_connectable: {
    matches: ['https://app.bmrk.cc/*', 'http://app.localhost:3000/*'],
  },
  background: {
    service_worker: './src/background.ts',
    type: 'module',
  },
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self';",
  },
  homepage_url: 'https://bmrk.cc',
  icons: {
    '16': 'icon16.png',
    '32': 'icon32.png',
    '48': 'icon48.png',
    '128': 'icon128.png',
  },
}));
