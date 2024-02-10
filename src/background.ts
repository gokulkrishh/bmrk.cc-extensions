import supabase from './lib/supabase';

chrome.tabs.onUpdated.addListener(async (_tabId, _changeInfo, tab: chrome.tabs.Tab | undefined) => {
  if (!tab?.url || !tab?.id) return;
  const url = new URL(tab?.url);
  if (url?.origin === 'https://bmrk.cc') {
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
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
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
  if (info.menuItemId === 'saveBookmark') {
    saveBookmark(tab);
  }
});

chrome.action.onClicked.addListener((tab: chrome.tabs.Tab | undefined) => {
  saveBookmark(tab);
});

const getUser = async () => {
  const { session } = (await chrome.storage.local.get('session')) || {};
  return session?.user;
};

type BookmarkInsert = {
  url: string;
  title: string;
  user_id: string;
};

const saveBookmark = async (tab: chrome.tabs.Tab | undefined) => {
  const user = await getUser();
  if (user && tab?.url) {
    try {
      const { error } = await supabase.from('bookmarks').insert({
        url: tab.url,
        title: tab.title,
        user_id: user.id,
      } as BookmarkInsert);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving bookmarks', error);
    }
  } else {
    console.error('URL is not allowed or user is not logged in.');
  }
};
