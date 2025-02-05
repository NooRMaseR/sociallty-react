import { createSlice, configureStore } from "@reduxjs/toolkit";
import { Media, PostProps } from "../components/post";
import { ACCESS } from "./constants";


const hasTokenSlice = createSlice({
    name: "hasToken",
    initialState: {
        value: localStorage.getItem(ACCESS) !== null
    },
    reducers: {
        setHasToken: (state, action: { payload: boolean, type: string }) => {
            state.value = action.payload;
        }
    }
})

const postsSlice = createSlice({
    name: "postsState",
    initialState: {
        value: [] as PostProps[]
    },
    reducers: {
        setPosts: (state, action: { payload: PostProps[], type: string }) => {
            state.value = action.payload;
        },
        UpdatePostCommentsCount: (state, action: {payload: {postID: number, count: number}}) => {
            const index = state.value.findIndex((po) => po.id === action.payload.postID);
            const post = state.value[index];
            post.comments_count = action.payload.count;
            state.value[index] = post;
        },
        appendPost: (state, action: { payload: PostProps, type: string }) => {
            state.value.push(action.payload);
        },
        appendPosts: (state, action: { payload: PostProps[], type: string }) => {
            action.payload.forEach(post => state.value.push(post))
        },
        removePost: (state, action: { payload: number, type: string }) => {
            state.value = state.value.filter((value) => value.id !== action.payload);
        }
    }
})

const currentRouteSlice = createSlice({
    name: "current_active_route",
    initialState: {
        value: location.pathname
    },
    reducers: {
        set_current_active_route: (state, action: { payload: string, type: string }) => {
            state.value = action.payload;
        }
    }
})

const commentSliderStateSlice = createSlice({
    name: "comment_slider_state",
    initialState: {
        last_post_id: -1,
        value: false
    },
    reducers: {
        setSliderOpen: (state, action: { payload: {last_post_id: number, value: boolean}, type: string }) => {
            state.value = action.payload.value;
            state.last_post_id = action.payload.last_post_id;
        }
    }
})

const bottomSheetSlice = createSlice({
    name: "bottomSheetState",
    initialState: {
        last_post_id: -1,
        open: false
    },
    reducers: {
        setBottomSheetOpen: (state, action: { payload: {last_post_id: number, open: boolean}, type: string }) => {
            state.open = action.payload.open;
            state.last_post_id = action.payload.last_post_id;
        }
    }
})

const backBgSlice = createSlice({
    name: "back_bg_state",
    initialState: {
        value: false
    },
    reducers: {
        setBackBg: (state, action: { payload: boolean, type: string } ) => {
            state.value = action.payload
        }
    }
})

const postContentSliderSlice = createSlice({
    name: "post_content_slider",
    initialState: {
        value: false,
        media: [] as Media[]
    },
    reducers: {
        setPostContentSlider: (state, action: { payload: {value: boolean, media: Media[]}, type: string }) => {
            state.value = action.payload.value;
            state.media = action.payload.media;
        }
    }
})

const friendsRequestsCountSlice = createSlice({
    name: 'friends_requests_count',
    initialState: {
        count: 0,
    },
    reducers: {
        setCount: (state, action: { payload: number, type: string }) => {
            state.count = action.payload;
        },
        decrementCount: (state) => {
            --state.count
        },
    }
})

const store = configureStore({
    reducer: {
        hasToken: hasTokenSlice.reducer,
        current_active_route: currentRouteSlice.reducer,
        comment_slider_state: commentSliderStateSlice.reducer,
        bottomSheetState: bottomSheetSlice.reducer,
        postsState: postsSlice.reducer,
        back_bg_state: backBgSlice.reducer,
        post_content_slider: postContentSliderSlice.reducer,
        friends_requests_count: friendsRequestsCountSlice.reducer,
    }
})

export const { setPosts, appendPost, appendPosts, removePost, UpdatePostCommentsCount} = postsSlice.actions;
export const { setCount, decrementCount } = friendsRequestsCountSlice.actions;
export const { setPostContentSlider } = postContentSliderSlice.actions;
export const { set_current_active_route } = currentRouteSlice.actions;
export const { setSliderOpen } = commentSliderStateSlice.actions;
export const { setBottomSheetOpen } = bottomSheetSlice.actions;
export const { setHasToken } = hasTokenSlice.actions;
export const { setBackBg } = backBgSlice.actions;
export default store;