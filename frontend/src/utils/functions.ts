/* eslint-disable @typescript-eslint/no-explicit-any */
import { ACCESS, ApiUrls, AR } from "./constants";
import dayjs from "dayjs";
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

/**
 * a function to send a request to add a friend
 * @param friendID the friend id to add
 * @returns `FriendRequest`
 */
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


/**
 * a function to send a request to remove a friend
 * @param friendID the friend id to add
 * @returns `FriendRequest`
 */
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


/**
 * a function to send a request to Delete friend request
 * @param friendID the friend id to add
 * @returns `FriendRequest`
 */
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

/**
 * a function to prevent the page from scrolling, `Toggle` scrolling
 * @param disable default `true` if `false` then enable the page to scroll
 */
export function disablePageScroll(disable: boolean = true) {
  document.body.style.overflow = disable ? "hidden" : 'initial';
};


/**
 * a function to long numbers to readable format
 * @param value the number to format
 * @returns the formated number like 1K 2M 3B
 */
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


/**
 * a function for adding extra security to the token, adding like first 5 letters to the end
 * @param token the token to format it
 * @param from_ add from `index`
 * @param to  add until `index`
 * @returns the new token in formated shape
 */
export function formatToken(token:string, from_: number = 0, to: number = 5): string {
  return token + token.substring(from_, to)
}


/**
 * a function the get the current token in a formated shape
 * @returns the formated token
 */
export function getFormatedToken(): string {
  return formatToken(localStorage.getItem(ACCESS) ?? "")
}


/**
 * a function is used to detect the text `dir`
 * @param text the text to detect `dir`
 * @returns the text `dir`
 */
export function textDir(text: string): "rtl" | "ltr" {
  if (text.length > 0 && AR.includes(text[0].toLowerCase())) return "rtl";
  else return "ltr";
};


/**
 * a function to format date
 * @param date the date to format
 * @param format the formated shape you need
 * @returns new formated date as `string`
 */
export function formatDate(date: string, format: string = "YYYY/MM/DD hh:mm A"): string {
  return dayjs(date).format(format);
}