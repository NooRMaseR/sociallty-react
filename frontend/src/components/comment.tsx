"use cache";

import { API_URL, CommentProps } from "../utils/constants";
import { UpdatePostCommentsCount } from "../utils/store";
import { useDispatch, useSelector } from "react-redux";
import { SetStateAction, useState } from "react";
import { Avatar } from "@mui/material";
import { PostProps } from "./post";
import api from "../utils/api";


interface ICommentProps {
    postID: number;
    comment: CommentProps;
    setCommentsUpdater: (value: SetStateAction<CommentProps[]>) => void;
}

export default function Comment({ postID, comment, setCommentsUpdater }: ICommentProps) {

    const [optionsOpened, setOptionsOpened] = useState<boolean>(false);
    const [likes, setLikes] = useState<number>(comment.comment_likes);
    const comments_Count = useSelector(
        (state: {postsState: {value: PostProps[]}}) => state.postsState.value.find((po) => po.id === postID)?.comments_count
    )
    const dispatch = useDispatch();

    const handelOpenOptions = () => {
        setOptionsOpened((prev) => !prev);
        setTimeout(() => setOptionsOpened(false), 7000);
    }

    const deleteComment = async () => {
        try {
            const res = await api.delete(`/api/post-comment/${comment.id}`);
            if (res.status === 200) {
                setCommentsUpdater((prevComments) => prevComments.filter((comm) => comm.id !== comment.id));
                dispatch(UpdatePostCommentsCount({postID, count: (comments_Count ?? comment.comment_likes) - 1}))
            }
        } catch {
            console.error('somthing went wrong');
        } finally {
            setOptionsOpened(false);
        }
    };
    
    const addCommentLike = async () => {
        try {
            const res = await api.post(`/api/add-comment-like/${comment.id}`);
            if (res.data.created) {
                setLikes((prevLike) => prevLike + 1);
            } else {
                setLikes((prevLike) => prevLike - 1);
            }
        } catch {
            console.error('somthing went wrong 2');
        } finally {
            setOptionsOpened(false);
        }
    }

    return (
        <>
            <div className='user-comment'>
                <div className={`comment-container-options ${optionsOpened ? 'options-opened': ''}`}>
              
                    <div className='option' onClick={addCommentLike}>
                        <p>Like</p>
                        <p>{likes}</p>
                    </div>
                    {/* check if the comment belong to the user or the post belong to the user */}
                    {comment.user.id === +(localStorage.getItem('id') ?? 0) && <p className='option'
                        onClick={deleteComment}
                    >Delete</p>}
                </div>
                <div className='comment-options-container'>
                    <i className="fa-solid fa-ellipsis fa-xl comment-options" title='Options'
                    onClick={handelOpenOptions}
                    ></i>
                </div>
                <div className="d-flex gap-2">
                    <Avatar src={`${API_URL}${comment.user.profile_picture}`} />
                    <a href='/profile/${comment.user.username}${comment.user_id}' className='comment-user'>{comment.user.username}</a>
                </div>
                <p className='comment-text'>{comment.content}</p>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
                    <p className='comment-time'>{new Date(comment.created_at).toLocaleString()}</p>
                </div>
            </div >
        </>
    )
}