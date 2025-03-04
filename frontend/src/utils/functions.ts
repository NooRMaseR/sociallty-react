/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiUrls } from "./constants";
import api from "./api";

interface ShareOptions {
  text?: string;
  title?: string;
  url?: string;
}

export type FriendRequest = {
  success: boolean;
  status: number;
  data: {details: string};
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
    await (navigator as Navigator).clipboard.writeText(real_url);
  }
}

export async function addFriend(friendID: number): Promise<FriendRequest> {
  try {
    const res = await api.post(ApiUrls.see_friends_requests, { friendID });
    return {
      success: res.status === 201,
      status: res.status,
      data: res.data
    };
  } catch (error: any) {
    return {
      success: error.response.status === 201,
      status: error.response.status,
      data: error.response.data
    };
  }
};

export async function removeFriend(friendID: number): Promise<FriendRequest> {
  try {
    const res = await api.delete(ApiUrls.see_user_friends, { data: { friendID } });
    return {
      success: res.status === 200,
      status: res.status,
      data: res.data
    };
  } catch (error: any) {
    return {
      success: error.response.status === 200,
      status: error.response.status,
      data: error.response.data
    };
  }
};

export async function deleteRequest(friendID: number): Promise<FriendRequest> {
  
  try {
    const res = await api.delete(ApiUrls.see_friends_requests, { data: { friendID } });
    
    if (res.status === 200) {
      return {
        success: true,
        status: res.status,
        data: res.data
      };
    }
    return {
      success: false,
      status: res.status,
      data: res.data
    };
  } catch (error: any) {
    return {
      success: false,
      status: error.response.status,
      data: error.response.data
    };
    
  }

}

export function disablePageScroll(disable: boolean = true) {
  document.body.style.overflow = disable ? "hidden" : 'initial';
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
