import api from "./api";

export async function handleShare(postId: number) {
  const url = `${location.origin}/post/${postId}`;
  if ("share" in navigator) {
    await navigator.share({
      text: "Post link",
      title: "Post link",
      url: url,
    });
  } else {
    (navigator as Navigator).clipboard.writeText(url);
  }
}

export const addFriend = async (friendID: number) => {
  try {
    const res = await api.post("social-users/", { friendID });
    return res.status === 201;
  } catch {
    return false;
  }
};

export const removeFriend = async (friendID: number) => {
  try {
    const res = await api.delete("social-users/", { data: { friendID } });
    return res.status === 200;
  } catch {
    return false;
  }
};
