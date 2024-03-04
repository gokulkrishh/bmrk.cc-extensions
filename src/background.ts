import supabase from 'lib/supabase';

import { BookmarkInsert } from 'types/data';

const manifestData = chrome.runtime.getManifest();

chrome.tabs.onUpdated.addListener(
  async (_tabId, _changeInfo, tab: chrome.tabs.Tab | undefined) => {
    if (!tab?.url || !tab?.id) return;
    if (tab.url?.startsWith(chrome.identity.getRedirectURL())) {
      await finishUserOAuth(tab.url, tab);
    }
  },
);

const finishUserOAuth = async (
  url: string,
  tab: chrome.tabs.Tab | undefined,
) => {
  if (tab && tab.status === 'complete') {
    if (!tab.id) return;
    try {
      const hashMap = parseUrlHash(url);
      const access_token = hashMap.get('access_token');
      const refresh_token = hashMap.get('refresh_token');
      if (!access_token || !refresh_token) {
        throw new Error(`no supabase tokens found in URL hash`);
      }
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error setting session', error);
    } finally {
      await chrome.tabs.remove(tab.id);
    }
  }
};

function parseUrlHash(url: string) {
  const hashParts = new URL(url).hash.slice(1).split('&');
  const hashMap = new Map(
    hashParts.map((part) => {
      const [name, value] = part.split('=');
      return [name, value];
    }),
  );

  return hashMap;
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install' && details.reason !== 'update') return;
  chrome.contextMenus.create({
    id: 'saveBookmark',
    title: 'Bookmark this page',
    contexts: ['all'],
  });
});

chrome?.contextMenus?.onClicked.addListener(
  (info, tab: chrome.tabs.Tab | undefined) => {
    if (info.menuItemId === 'saveBookmark' && tab) {
      saveBookmark(tab);
    }
  },
);

const forceRefreshBookmarks = async () => {
  // To force refresh chrome extension when a bookmark is save;
  const cacheTime = Date.now() - 7200 * 1111; // setting cache time 2hr + few secs to force refresh
  const storage = await chrome.storage.local.get('cache');
  await chrome.storage.local.set({ cache: storage?.cache || [], cacheTime });
  await chrome.runtime.sendMessage({ type: 'refreshBookmarks' });
};

const forceLogout = async () => {
  await chrome.runtime.sendMessage({ type: 'forceLogout' });
};

const showSuccessBadge = async (tabId: number) => {
  await chrome.action.setBadgeBackgroundColor(
    { color: '#00FF00' },
    async () => {
      await chrome.action.setBadgeText({ tabId, text: '✓' });
      setTimeout(() => chrome.action.setBadgeText({ tabId, text: '' }), 6000);
    },
  );
};

const showErrorBadge = async (tabId: number) => {
  await chrome.action.setBadgeBackgroundColor({ color: '#ff0' }, async () => {
    await chrome.action.setBadgeText({ tabId, text: 'Failed' });
    setTimeout(() => chrome.action.setBadgeText({ tabId, text: '' }), 6000);
  });
};

const saveBookmark = async (tab: chrome.tabs.Tab) => {
  if (tab.url && tab.title && tab.id) {
    const { data } = await supabase.auth.getUser();
    const { user } = data;
    const tabId = tab.id;
    chrome.action.setBadgeText({ text: '', tabId: tab.id });

    if (user?.id) {
      const payload = {
        title: tab.title,
        url: tab.url,
        metadata: { is_via_extension: true },
      };

      try {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ ...payload, user_id: user.id } as BookmarkInsert);

        if (error) {
          await showErrorBadge(tabId);
          throw new Error('Error saving the bookmark. Try again.');
        }

        const { error: IncrementError } = await supabase.rpc(
          'increment_bookmarks_usage',
          { user_id: user.id, count: 1 },
        );

        if (IncrementError) {
          await showErrorBadge(tabId);
          throw new Error('Unable to increment usage.');
        }

        await showSuccessBadge(tabId);
        await forceRefreshBookmarks();
      } catch (error) {
        console.log('Error saving the bookmark', error);
      }
    } else {
      await showErrorBadge(tabId);
    }
  }
};

const whitelistedUrls = manifestData?.externally_connectable?.matches?.map(
  (url) => url.split('*')[0],
);

chrome.runtime.onMessageExternal.addListener(async (request, sender) => {
  if (sender?.url && whitelistedUrls?.includes(sender?.url)) {
    if (request.refresh) {
      await forceRefreshBookmarks();
    } else if (request.logout) {
      await forceLogout();
    }
  }
});
