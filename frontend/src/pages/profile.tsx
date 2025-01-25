import {
  addFriend,
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
import { Backdrop, Box, Button, ButtonGroup, Skeleton } from "@mui/material";
import CommentsSlider from "../components/comments_slider";
import { Link, useSearchParams } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import PostSkelaton from "../components/post_skelaton";
import Post, { PostProps } from "../components/post";
import ButtomSheet from "../components/buttom_sheet";
import QrCodeIcon from "@mui/icons-material/QrCode";
import EditIcon from "@mui/icons-material/Edit";
import { QRCodeCanvas } from "qrcode.react";
import { Helmet } from "react-helmet";
import api from "../utils/api";
import "../styles/profile.css";

export default function ProfilePage() {
  const [user, setUser] = useState<FullUser>({} as FullUser);
  const [error, setError] = useState<string | null>(null);
  const [is_friend, setIsFriend] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [openQr, setOpenQr] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [isFIrst, setIsFirst] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [params] = useSearchParams();

  const isAuthor = user.id == +(localStorage.getItem("id") ?? -1);

  const toggleFriend = async () => {
    let success: boolean;

    if (is_friend) success = await removeFriend(user.id);
    else success = await addFriend(user.id);

    if (success) setIsFriend((pre) => !pre);
  };

  useEffect(() => {
    const fetchUser = async () => {
      document.documentElement.scrollTop = 0;
      setError(null);
      try {
        const res = await api.get<UserProfileResponse>(
          `${ApiUrls.user_log_sign}${
            params.get("username") || localStorage.getItem("username")
          }/${
            params.get("id") || localStorage.getItem("id")
          }/?page=${pageNumber}`
        );

        if (isFIrst) {
          setUser(res.data.user);
          setIsFriend(res.data.is_friend);
          setIsFirst(false);
          setPosts(res.data.posts);
        } else {
          setPosts((pre) => [...pre, ...res.data.posts]);
        }
        setHasNext(res.data.has_next);
        setLoaded(true);
      } catch {
        setError(
          "User Not Found, Please Try To Refresh the page or contact us"
        );
      }
    };

    fetchUser();
  }, [pageNumber, params]);

  const SkelatonPlaceHolders = () => {
    const sks: ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      sks.push(<PostSkelaton key={i} />);
    }
    return sks;
  };

  const AccountPosts = () => {
    if (user.settings?.is_private_account && !is_friend && !isAuthor)
      return <h1 className="text-white">Private Account</h1>;
    else
      return (
        <Box id="posts">
          <ButtomSheet />
          <CommentsSlider />
          {!loaded ? (
            <SkelatonPlaceHolders />
          ) : (
            <>
              {posts.map((data) => (
                <Post post={data} key={data.id} />
              ))}
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
            </>
          )}
        </Box>
      );
  };

  const Profileskeleton = () => (
    <>
      <div id="user-profile-pic">
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{ width: "80%", height: "20rem", bgcolor: "#292929", mb: "2rem" }}
        />
      </div>
      <div id="info">
        <div id="counters" className="d-flex gap-4">
          <div>
            <Skeleton
              variant="text"
              animation="wave"
              sx={{ width: "7rem", height: "6rem", bgcolor: "#292929" }}
            />
          </div>
          <div>
            <Skeleton
              variant="text"
              animation="wave"
              sx={{ width: "7rem", height: "6rem", bgcolor: "#292929" }}
            />
          </div>
        </div>
        <div id="user-info">
          <div style={{ width: "100%" }}>
            <Skeleton
              variant="text"
              animation="wave"
              sx={{ width: "6rem", height: "2rem", bgcolor: "#292929" }}
            />
            <Skeleton
              variant="text"
              animation="wave"
              sx={{ width: "100%", height: "2rem", bgcolor: "#292929" }}
            />
            <Skeleton
              variant="text"
              animation="wave"
              sx={{ width: "60%", height: "2rem", bgcolor: "#292929" }}
            />
            <Skeleton
              variant="text"
              animation="wave"
              sx={{ width: "20%", height: "2rem", bgcolor: "#292929" }}
            />
          </div>
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{ width: "7rem", height: "2rem", bgcolor: "#292929" }}
          />
        </div>
      </div>
    </>
  );

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
              <div id="user-profile-pic">
                <img
                  src={`${API_URL}${user.profile_picture}`}
                  alt="user profile pic"
                />
              </div>
              <div id="info">
                <div id="counters" className="d-flex gap-4">
                  <div>
                    <p>Friends</p>
                    <p>{formatNumbers(user.friends_count ?? 0)}</p>
                  </div>
                  <div>
                    <p>Posts</p>
                    <p>{formatNumbers(posts.length)}</p>
                  </div>
                </div>
                <div id="user-info">
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
                      <Link to="/user/edit" className="btn btn-primary">
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
