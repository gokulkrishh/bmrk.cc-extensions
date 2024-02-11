import supabase from 'lib/supabase';

import { BookmarkInsertModified } from 'types/data';

chrome.tabs.onUpdated.addListener(async (_tabId, _changeInfo, tab: chrome.tabs.Tab | undefined) => {
  if (!tab?.url || !tab?.id) return;
  if (tab.url?.startsWith(chrome.identity.getRedirectURL())) {
    await finishUserOAuth(tab.url, tab);
  }
});

const finishUserOAuth = async (url: string, tab: chrome.tabs.Tab | undefined) => {
  if (tab && tab.status === 'complete') {
    if (!tab.id) return;
    try {
      const hashMap = parseUrlHash(url);
      const access_token = hashMap.get('access_token');
      const refresh_token = hashMap.get('refresh_token');
      if (!access_token || !refresh_token) {
        throw new Error(`no supabase tokens found in URL hash`);
      }
      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
      await chrome.storage.local.set({ session: data.session });
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
    })
  );

  return hashMap;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveBookmark',
    title: 'Bookmark this page',
    contexts: ['page'],
  });
});

chrome?.contextMenus?.onClicked.addListener((info, tab: chrome.tabs.Tab | undefined) => {
  if (info.menuItemId === 'saveBookmark' && tab) {
    saveBookmarkInPopup(tab);
  }
});

const saveBookmarkInPopup = async (tab: chrome.tabs.Tab) => {
  if (tab.url && tab.title) {
    const { session } = (await chrome.storage.local.get('session')) || {};
    const payload: BookmarkInsertModified = {
      title: tab.title,
      url: tab.url,
      user_id: session.user?.id,
      metadata: { is_via_extension: true },
    };
    chrome.runtime.sendMessage({ payload, type: 'saveBookmark' });
  }
};
