import supabase, { getUser } from 'lib/supabase';

import { toast } from 'sonner';
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
    let setSession = false;
    try {
      const hashMap = parseUrlHash(url);
      const access_token = hashMap.get('access_token');
      const refresh_token = hashMap.get('refresh_token');
      if (!access_token || !refresh_token) {
        throw new Error(`no supabase tokens found in URL hash`);
      }
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) throw error;
      await chrome.storage.local.set({ session: data.session });
      setSession = true;
    } catch (error) {
      console.error('Error setting session', error);
    } finally {
      if (setSession) {
        await chrome.tabs.remove(tab.id);
      }
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
  if (info.menuItemId === 'saveBookmark') {
    saveBookmark(tab);
  }
});

chrome.action.onClicked.addListener((tab: chrome.tabs.Tab | undefined) => {
  saveBookmark(tab);
});

const saveBookmark = async (tab: chrome.tabs.Tab | undefined) => {
  if (tab?.url) {
    try {
      const user = await getUser();
      const { error } = await supabase.from('bookmarks').insert({
        url: tab.url,
        title: tab.title,
        user_id: user?.id,
        metadata: { is_via_extension: true },
      } as BookmarkInsertModified);
      if (error) throw error;
      toast.success('Bookmark saved.');
    } catch (error) {
      toast.error('Error saving bookmark, please try again.');
    }
  } else {
    toast.error('URL is not allowed.');
  }
};
