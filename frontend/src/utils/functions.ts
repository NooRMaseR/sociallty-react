import api from "./api";
import { ApiUrls } from "./constants";

interface ShareOptions {
  text?: string;
  title?: string;
  url?: string;
}

/**
 * a funtion to share a link
 * @param postId the post id to share
 * @param options additinal options for share containes `{title, text, url}` if not url then will use the default post url
 */
export async function share(postId?: number, options: ShareOptions = { title: 'Post Link', text: 'Post Link'}) {
  const real_url = options.url ?? `${location.origin}/post/${postId}`;
  if ("share" in navigator) {
    await navigator.share({
      text: options.text,
      title: options.title,
      url: real_url,
    });
  } else {
    (navigator as Navigator).clipboard.writeText(real_url);
  }
}

export async function addFriend(friendID: number) {
  try {
    const res = await api.post(ApiUrls.social_users, { friendID });
    return res.status === 201;
  } catch {
    return false;
  }
};

export async function removeFriend(friendID: number) {
  try {
    const res = await api.delete(ApiUrls.social_users, { data: { friendID } });
    return res.status === 200;
  } catch {
    return false;
  }
};

export function disablePageScroll(disable: boolean = true) {
  document.body.style.overflow = disable ? "hidden" : 'auto';
};

export function formatNumbers(value: number): string {
  if (value < 1000) {
    return value.toString();
  } else if (value < 999_999) {
    const _value = value / 1000;
    return `${_value.toFixed(1)}K`;
  } else if (value < 999_999_999) {
    const _value = value / 1_000_000;
    return `${Math.floor(_value)}M`;
  } else {
    const _value = value / 1_000_000_000;
    return `${Math.floor(_value)}B`;
  }
}
