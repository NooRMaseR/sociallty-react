import {
  addFriend,
  deleteRequest,
  disablePageScroll,
  formatNumbers,
  removeFriend,
} from "../utils/functions";
import {
  API_URL,
  ApiUrls,
  FullUser,
  UserProfileResponse,
} from "../utils/constants";
import React, {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Backdrop, Box, Button, ButtonGroup } from "@mui/material";
import Profileskeleton from "../components/profile_page_skelaton";
import { Link, useSearchParams } from "react-router-dom";
import PostSkelaton from "../components/post_skelaton";
import { useLoadingBar } from "react-top-loading-bar";
import { Image } from "../components/media_skelatons";
import QrCodeIcon from "@mui/icons-material/QrCode";
import styles from "../styles/profile.module.css";
import EditIcon from "@mui/icons-material/Edit";
import { PostProps } from "../components/post";
import { QRCodeCanvas } from "qrcode.react";
import { Helmet } from "react-helmet";
import api from "../utils/api";

const SkelatonPlaceHolders = memo(() => (
  Array.from({ length: 5 }, (_, i) => <PostSkelaton key={i} />)
));

const LazyPost = React.lazy(() => import("../components/post"));
const LazyBottomSheet = React.lazy(() => import("../components/buttom_sheet"));
const LazyCommentsSlider = React.lazy(
  () => import("../components/comments_slider")
);

const Posts = memo(({ posts }: { posts: PostProps[] }) => {
  const renderPosts = useMemo(() =>
    posts.map((data) => <LazyPost post={data} key={data.id} />), [posts]
  );
  return <Suspense fallback={<PostSkelaton />}>{renderPosts}</Suspense>;
}
);


export default function ProfilePage() {
  const [user, setUser] = useState<FullUser>({} as FullUser);
  const [error, setError] = useState<string | null>(null);
  const [is_friend, setIsFriend] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [openQr, setOpenQr] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [isFIrst, setIsFirst] = useState<boolean>(true);
  const [requestSent, setRequestSent] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { start, complete } = useLoadingBar();
  const [params] = useSearchParams();

  const isAuthor = user.id == +(localStorage.getItem("id") ?? -1);

  const toggleFriend = useCallback(async () => {
    if (is_friend) {
      await removeFriend(user.id);
      setRequestSent(false);
      setIsFriend(false);
    } else if (requestSent) {
      await deleteRequest(user.id);
      setRequestSent(false);
      setIsFriend(false);
    } else {
      await addFriend(user.id);
      setRequestSent(true);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    document.documentElement.scrollTop = 0;
    setError(null);
    try {
      const res = await api.get<UserProfileResponse>(
        `${ApiUrls.user_log_sign}${
          params.get("username") || localStorage.getItem("username")
        }/${params.get("id") || localStorage.getItem("id")}/?page=${pageNumber}`
      );

      if (isFIrst) {
        setUser(res.data.user);
        setIsFriend(res.data.is_friend);
        setIsFirst(false);
        setPosts(res.data.posts);
        complete();
      } else {
        setPosts((pre) => [...pre, ...res.data.posts]);
      }
      setHasNext(res.data.has_next);
      setLoaded(true);
    } catch {
      setError("User Not Found, Please Try To Refresh the page or contact us");
    }
  }, [pageNumber, params, complete]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const AccountPosts = memo(() => {
    if (user.settings?.is_private_account && !is_friend && !isAuthor)
      return <h1>Private Account</h1>;
    else
      return (
        <Box id="posts">
          <LazyBottomSheet />
          <LazyCommentsSlider />
          {!loaded ? (
            <SkelatonPlaceHolders />
          ) : (
            <>
              <Suspense fallback={<PostSkelaton />}>
                <Posts posts={posts} />
                <div>
                  {hasNext ? (
                    <Button
                      type="button"
                      variant="contained"
                      onClick={() => setPageNumber((prev) => prev + 1)}
                    >
                      Load More
                    </Button>
                  ) : (
                    <p>No More Posts...</p>
                  )}
                </div>
              </Suspense>
            </>
          )}
        </Box>
      );
  });

  useEffect(() => {
    disablePageScroll(openQr);
  }, [openQr]);

  return (
    <>
      <Helmet>
        <title>Profile</title>
        <meta
          name="description"
          content="User Profile Page, Get your Social informations from here"
        />
      </Helmet>
      {error ? (
        <h1 className="text-white">{error}</h1>
      ) : (
        <main>
          {!loaded ? (
            <Profileskeleton />
          ) : (
            <>
              <Backdrop
                open={openQr}
                onClick={() => setOpenQr(false)}
                sx={{ zIndex: 1 }}
              >
                <QRCodeCanvas
                  value={`${location.origin}/social-user-profile?username=${
                    params.get("username") || user.username
                  }&id=${params.get("id") || user.id}`}
                  size={320}
                />
              </Backdrop>
              <div id={styles["user-profile-pic"]}>
                <Image
                  src={`${API_URL}${user.profile_picture}`}
                  alt="user profile pic"
                />
              </div>
              <div id={styles["info"]}>
                <div id={styles["counters"]} className="d-flex gap-4">
                  <div>
                    <p>Friends</p>
                    <p>{formatNumbers(user.friends_count ?? 0)}</p>
                  </div>
                  <div>
                    <p>Posts</p>
                    <p>{formatNumbers(posts.length)}</p>
                  </div>
                </div>
                <div id={styles["user-info"]}>
                  <div>
                    <h1>{user.username}</h1>
                    <p>{user.bio}</p>
                  </div>

                  {/* check if the user is seeing his own profile to let him edit his profile */}
                  {isAuthor ? (
                    <Box
                      className="d-flex gap-3"
                      sx={{ flexDirection: "row-reverse !important" }}
                    >
                      <Link to="/user/edit" onClick={() => start()} className="btn btn-primary">
                        <EditIcon />
                        Edit
                      </Link>
                      <button
                        className="btn btn-primary"
                        onClick={() => setOpenQr(true)}
                      >
                        <QrCodeIcon />
                        Qr Code
                      </button>
                    </Box>
                  ) : is_friend ? (
                    <ButtonGroup
                      variant="contained"
                      className="d-flex gap-3"
                      sx={{ flexDirection: "row-reverse !important" }}
                    >
                      <Button onClick={toggleFriend}>Remove Friend</Button>
                      <Button onClick={() => setOpenQr(true)}>
                        <QrCodeIcon />
                        Qr Code
                      </Button>
                    </ButtonGroup>
                  ) : requestSent ? (
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "#292929" }}
                      onClick={toggleFriend}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={toggleFriend}>
                      Add Friend
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
          <AccountPosts />
        </main>
      )}
    </>
  );
}
