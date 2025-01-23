import { API_URL, FullUser, UserProfileResponse } from "../utils/constants";
import { ReactNode, useCallback, useEffect, useState } from "react";
import CommentsSlider from "../components/comments_slider";
import { Link, useSearchParams } from "react-router-dom";
import PostSkelaton from "../components/post_skelaton";
import { Box, Button, Skeleton } from "@mui/material";
import Post, { PostProps } from "../components/post";
import ButtomSheet from "../components/buttom_sheet";
import EditIcon from "@mui/icons-material/Edit";
import api from "../utils/api";
import "../styles/profile.css";

export default function ProfilePage() {
  document.title = "Profile";

  const [user, setUser] = useState<FullUser>({} as FullUser);
  const [error, setError] = useState<string | null>(null);
  const [is_friend, setIsFriend] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [isFIrst, setIsFirst] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [params] = useSearchParams();

  
  const fetchUser = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<UserProfileResponse>(
        `/user/${params.get("username") || localStorage.getItem("username")}/${
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
      };
      setHasNext(res.data.has_next)
      setLoaded(true);
    } catch {
      setError("User Not Found, Please Try To Refresh the page or contact us");
    }
    document.documentElement.scrollTop = 0;
  }, [params, pageNumber]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const SkelatonPlaceHolders = () => {
    const sks: ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      sks.push(<PostSkelaton key={i} />);
    }
    return sks;
  };

  return (
    <>
      {error ? <h1 className="text-white">{error}</h1> : (
        <main>
          {!loaded ? (
            <>
              <div id="user-profile-pic">
                <Skeleton variant="rounded" animation='wave' sx={{ width: '80%', height: "10rem", bgcolor: '#292929', mb: '2rem' }} />
              </div>
              <div id="info">
                <div id="counters" className="d-flex gap-4">
                  <div>
                    <Skeleton variant="text" animation='wave' sx={{ width: '7rem', height: "6rem", bgcolor: "#292929" }} />
                  </div>
                  <div>
                    <Skeleton variant="text" animation='wave' sx={{ width: '7rem', height: "6rem", bgcolor: "#292929" }} />
                  </div>
                </div>
                <div id="user-info">
                  <div style={{ width: '100%' }}>
                    <Skeleton variant="text" animation='wave' sx={{ width: '6rem', height: "2rem", bgcolor: "#292929" }} />
                    <Skeleton variant="text" animation='wave' sx={{ width: '100%', height: "2rem", bgcolor: "#292929" }} />
                    <Skeleton variant="text" animation='wave' sx={{ width: '60%', height: "2rem", bgcolor: "#292929" }} />
                    <Skeleton variant="text" animation='wave' sx={{ width: '20%', height: "2rem", bgcolor: "#292929" }} />
                  </div>
                  <Skeleton variant="rectangular" animation='wave' sx={{ width: '7rem', height: "2rem", bgcolor: "#292929" }} />
                </div>
              </div>
            </>
          ) : (
            <>
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
                    <p>{user.friends_count}</p>
                  </div>
                  <div>
                    <p>Posts</p>
                    <p>{posts.length}</p>
                  </div>
                </div>
                <div id="user-info">
                  <div>
                    <h1>{user.username}</h1>
                    <p>{user.bio}</p>
                  </div>

                  {/* check if the user is seeing his own profile to let him edit his profile */}
                  {user.id == +(localStorage.getItem("id") ?? -1) ? (
                    <Link to="/edit-profile" className="btn btn-primary">
                      <EditIcon />
                      <Button sx={{ color: "#fff" }}>Edit</Button>
                    </Link>
                  ) : is_friend ? (
                    <Button variant="contained">Remove Friend</Button>
                  ) : (
                    <Button variant="contained">Add Friend</Button>
                  )}
                </div>
              </div>
            </>
          )}
          <div id="post-content-slider">
            <div
              id="close-slide-container"
            // onclick="close_content_slider()"
            >
              <p
                id="close-content-slider"
                style={{ color: "var(--text-color)", cursor: "pointer" }}
              >
                X
              </p>
            </div>

            <div id="content"></div>
          </div>
          <Box id="posts">
            <ButtomSheet />
            <CommentsSlider />
            {!loaded ? (
              <SkelatonPlaceHolders />
            ) : (
              <>
                {posts.map((data, index) => (
                  <Post post={data} key={index} />
                ))}
                <div>
                  {hasNext ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setPageNumber((prev) => prev + 1)}
                    >
                      Load More
                    </button>
                  ) : (
                    <p>No More Posts...</p>
                  )}
                </div>
              
              </>
            )}
          </Box>
        </main>
      )}
    </>
  );
}
