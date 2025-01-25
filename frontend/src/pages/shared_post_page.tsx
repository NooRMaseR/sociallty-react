import { ApiUrls, PostsStateType } from "../utils/constants";
import CommentsSlider from "../components/comments_slider";
import RestPostMedia from "../components/rest_post_media";
import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import PostSkelaton from "../components/post_skelaton";
import Post, { PostProps } from "../components/post";
import { useParams } from "react-router-dom";
import { setPosts } from "../utils/store";
import { Helmet } from "react-helmet";
import { Box } from "@mui/material";
import api from "../utils/api";

export default function SharedPostPage() {

    const { id } = useParams();
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [errorType, setErrorType] = useState<number>(200);
    const dispatch = useDispatch();
    
    const post = useSelector(
        (state: PostsStateType) => state.postsState.value
    );

    const getPost = useCallback(async () => {
        try {
            const res = await api.get<PostProps>(ApiUrls.post + id?.toString());
            if (res?.status === 200) {
                dispatch(setPosts([res.data]));
                setIsLoaded(true);
            } else {
                setErrorType(404);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setErrorType(error.response.status);
        }
    }, [id, dispatch])
    useEffect(() => {
        getPost();
    }, [getPost])

    return (
        <Box id="posts">
            <Helmet>
                <title>Sociallty</title>
                <meta name="description" content="Check Out This Post From This Link, Check it out Now" />
            </Helmet>
            <RestPostMedia />
            <CommentsSlider />
            {isLoaded ? post.map((po) => <Post post={po} key={po.id}/>) : errorType === 404 ? <h1 className="text-white">Something went Wrong....</h1> :<PostSkelaton />}
        </Box>
    )
}