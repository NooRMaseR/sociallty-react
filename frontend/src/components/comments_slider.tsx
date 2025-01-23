import api from "../utils/api";
import Comment from "./comment";
import { useEffect, useState } from "react";
import SendIcon from '@mui/icons-material/Send';
import { CommentProps } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import { setSliderOpen, UpdatePostCommentsCount } from "../utils/store";

export default function CommentsSlider() {
    const dispatch = useDispatch();
    const [comment, setComment] = useState<string>('');
    const [comments, setComments] = useState<CommentProps[]>([]);
    const opened = useSelector(
        (state: { comment_slider_state: { value: boolean } }) => state.comment_slider_state.value
    );
    const last_post_id= useSelector(
        (state: { comment_slider_state: { last_post_id: number} }) => state.comment_slider_state.last_post_id
    );

    useEffect(() => {
        const getComments = async () => {
            setComment('');
            try {
                const res = await api.get(`/api/post-comment/${last_post_id}`);
            
                if (res.status === 200) {
                    setComments(res.data.comments);
                } else {
                    setComments([]);
                }
            } catch (error) {
                setComments([])
                console.error(error);
            }
        };
        if (opened) getComments();
    }, [opened, last_post_id])

    
    const sendComment = async () => {
        const res = await api.post<CommentProps>(`/api/post-comment/${last_post_id}`, { comment });
        
        if (res.status === 201) {
            setComment('');
            setComments((prevComments) => [...prevComments, res.data]);
            dispatch(UpdatePostCommentsCount({postID: last_post_id, count: comments.length + 1 }))
        }
    };
    
    return (
        <div id="slide-bar-comments" className={opened ? 'slide-opened' : ''}>
            <h2 style={{ textAlign: 'center', marginBlock: '10px', color: 'var(--text-color)'}}>Comments</h2>
            <hr />
            <div id="close-slide-container">
                <p id="close-comments-slider"
                    onClick={() => dispatch(setSliderOpen({value: false, last_post_id: -1}))}
                    style={{ color: 'var(--text-color)', cursor: 'pointer' }}>X</p>
            </div>

            <div id="comments">
                {comments.map((commentObj) => <Comment comment={commentObj} key={commentObj.id} postID={last_post_id} setCommentsUpdater={setComments}/>)}
            </div>

            <div id="div-send">
                <input type="text" id="comment-field" placeholder="new comment..." onChange={(e) => setComment(e.target.value)} value={comment} />
                <button type="button" id="send-comment" onClick={sendComment} title="Send Comment">
                    <SendIcon  />
                </button>
            </div>
        </div>
    )
}