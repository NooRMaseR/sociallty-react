import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';

import { MEDIA_URL, CurrentActiveRouteStateType, FriendsRequestsCountStateType, HasTokenStateType, API_URL, ApiUrls, FullUser } from '../utils/constants';
import { set_current_active_route, setCount } from "../utils/store";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Badge, Box, Tooltip, Typography } from '@mui/material';
import { memo, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLoadingBar } from "react-top-loading-bar";
import { LazyAvatar } from './media_skelatons';
import api from '../utils/api';
import '../styles/nav.css'

interface CheckHeadProps {
    current_route: string;
    menuOpened: boolean;
    isAuthed: boolean;
    forDeskTop?: boolean;
    friends_requests_count: number;
    startLoading: (url: string) => void;
    onMenuClick?: (open: boolean) => void;
}

interface Notification {
    id: number;
    to_user: FullUser;
    from_user: FullUser;
    content: string;
}

interface NotificationProps {
    friends_requests_count: number;
    notifications: Notification[];
}

const CheckHead = memo(({ isAuthed, current_route, menuOpened, forDeskTop, friends_requests_count, startLoading, onMenuClick }: CheckHeadProps) => {
    if (isAuthed) {
        return (
            <>
                <Box component="ul" className={forDeskTop ? 'desktop-layout' : ''}>
                    <li>
                        <Tooltip title='Home'>
                            <Link to="/" onClick={() => startLoading("/")} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/" ? 'active-head' : ''} d-flex gap-2`}>
                                <HomeIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <Typography className="label-for m-0">Home</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Profile">
                            <Link to="/social-user-profile" onClick={() => startLoading("/social-user-profile")} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/social-user-profile" ? 'active-head' : ''} d-flex gap-2`}>
                                <PersonIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <Typography className="label-for m-0">My Profile</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Friends Requests">
                            <Link to="/see-friends-requests" onClick={() => startLoading("/see-friends-requests")} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/see-friends-requests" ? 'active-head' : ''} d-flex gap-2`}>
                                <Badge badgeContent={friends_requests_count} color='primary'>
                                    <GroupAddIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                </Badge>
                                <Typography className="label-for m-0">Firends Requests</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="My Friends">
                            <Link to="/see-user-friends" onClick={() => startLoading("/see-user-friends")} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/see-user-friends" ? 'active-head' : ''} d-flex gap-2`}>
                                <PeopleIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <Typography className="label-for m-0">My Firends</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Add Friends">
                            <Link to="/social-friends" onClick={() => startLoading("/social-friends")} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/social-friends" ? 'active-head' : ''} d-flex gap-2`}>
                                <PersonAddIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <Typography className="label-for m-0">Add Friends</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                </Box>
                <Box component="ul" className={forDeskTop ? 'desktop-layout' : ''}>
                    <li>
                        <Tooltip title="Chats">
                            <Link to="/chat" onClick={() => startLoading("/chat")} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/chat" ? 'active-head' : ''} d-flex gap-2`}>
                                <ChatIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <Typography className="label-for m-0">Chat</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Q&A">
                            <Link to="/common-questions" onClick={() => startLoading("/common-questions")} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/common-questions" ? 'active-head' : ''} d-flex gap-2`}>
                                <SupportAgentIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <Typography className="label-for m-0">Q&A</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Settings">
                            <Link to="/user/settings" onClick={() => startLoading("/user/settings")} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/user/settings" ? 'active-head' : ''} d-flex gap-2`}>
                                <SettingsIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <Typography className="label-for m-0">Settings</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Logout">
                            <Link to='/logout' onClick={() => startLoading("/logout")} className={`nav-link ${menuOpened ? 'show' : ''}`}>
                                <LogoutIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <Typography className="label-for m-0">Logout</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                </Box>
                <svg className={`ham hamRotate ham8 ${menuOpened && 'active'}`} id="menu" viewBox="0 0 100 100" width="80" onClick={() => onMenuClick && onMenuClick(!menuOpened)}>
                    <path className="line top"
                        d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20" />
                    <path className="line middle" d="m 30,50 h 40" />
                    <path className="line bottom"
                        d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20" />
                </svg>
            </>
        )
    } else if (current_route !== "/login") {
        return (
            <>
                <Box className={forDeskTop ? 'desktop-layout' : ''} component='ul' sx={{padding: 0}}>
                    <li>
                        <Tooltip title="Login">
                            <Link to="/login" onClick={() => startLoading("/login")} className={`nav-link ${menuOpened ? 'show' : ''}`}>
                                <LoginIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <Typography className="label-for m-0">Login</Typography>
                            </Link>
                        </Tooltip>
                    </li>
                </Box>
                <svg className={`ham hamRotate ham8 ${menuOpened && 'active'}`} id="menu" viewBox="0 0 100 100" width="80" onClick={() => onMenuClick && onMenuClick(!menuOpened)}>
                    <path className="line top"
                        d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20" />
                    <path className="line middle" d="m 30,50 h 40" />
                    <path className="line bottom"
                        d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20" />
                </svg>
            </>
        )
    }
});


export default function Header() {
    const [menuOpened, setMenuOpened] = useState<boolean>(false);
    const dispatch = useDispatch();
    const location = useLocation();
    const { start } = useLoadingBar();
    const navigate = useNavigate();
    
    const isAuthed = useSelector(
        (state: HasTokenStateType) => state.hasToken.value
    );
    const current_route = useSelector(
        (state: CurrentActiveRouteStateType) => state.current_active_route.value
    );
    const friends_requests_count = useSelector(
        (state: FriendsRequestsCountStateType) => state.friends_requests_count.count
    );


    const delete_notification = useCallback(async (notification: Notification) => {
        try {
            await api.delete(`${API_URL}/${ApiUrls.user_requests_count}`, {
                data: {
                    id: notification.id
                }
            });
        } catch {
            console.error("error while delete notification")
        }
    }, []);

    const create_notification = async (notification: Notification) => {
        try {
            // Check if the browser supports notifications
            if (!("Notification" in window)) {
                console.error("This browser does not support notifications");
                return;
            }

            // Request permission if not already granted
            if (Notification.permission !== "granted") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    console.log("Notification permission denied");
                    return;
                }
            }

            // Create and show the notification
            const noti = new Notification(notification.from_user.username, {
                body: notification.content,
                icon: `${API_URL}${notification.from_user.profile_picture}`,
            });

            // Add click handler
            noti.onclick = () => {
                window.focus(); // Focus the window
                navigate(`/chat/${notification.from_user.id}?username=${notification.from_user.username}#message-${notification.from_user.id}`);
                noti.close(); // Close the notification after clicking
            };

            // Add error handler
            noti.onerror = (error) => {
                console.error("Error while creating notification:", error);
            };

        } catch (error) {
            console.error("Error in create_notification:", error);
        }
    }


    useEffect(() => {
        setMenuOpened(false);
        dispatch(set_current_active_route(location.pathname));
    }, [dispatch, location.pathname])

    useEffect(() => {
        async function get_requests() {
            try {
                const res = await api.get<NotificationProps>(`${API_URL}/${ApiUrls.user_requests_count}`);
    
                if (res.status === 200) {
                    dispatch(setCount(res.data.friends_requests_count));
                    const notisToSend = [];
                    const notisToDelete = [];
                    for (let i = 0; i < res.data.notifications.length; i++) {
                        const noti = res.data.notifications[i];
                        notisToSend.push(create_notification(noti));
                    }
                    await Promise.all(notisToSend);

                    for (let i = 0; i < res.data.notifications.length; i++) {
                        const noti = res.data.notifications[i];
                        notisToDelete.push(delete_notification(noti));
                    }
                    await Promise.all(notisToDelete);
                }
            } catch {
                console.error("field to get requests count");
            }
        };

        const inter = setInterval(get_requests, 10000);
        return () => clearInterval(inter);

    }, [create_notification, delete_notification, dispatch])

    const startLoading = useCallback((url: string) => {
        if (current_route !== url) start();
    }, [current_route]);

    if (current_route.startsWith("/chat/")) return <></>
    return (
        <header>
            <nav className={menuOpened ? 'show-nav' : ''}>
                <Box sx={{display: 'flex', gap: '1rem'}}>
                    <LazyAvatar src={isAuthed ? `${MEDIA_URL}${localStorage.getItem("profile_pic")}` : '/favicon.ico'} alt='profile picture'/>
                    <Box sx={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "start"}}>
                        <Typography variant='h5'>Sociallty</Typography>
                        <Typography sx={{padding: 0}}>{isAuthed ? localStorage.getItem("username") : "welcome"}</Typography>
                    </Box>
                </Box>
                <Box className="mobile-layout" sx={{ width: '100%' }}>
                    <CheckHead current_route={current_route} isAuthed={isAuthed} friends_requests_count={friends_requests_count} menuOpened={menuOpened} startLoading={startLoading} />
                </Box>
                <CheckHead current_route={current_route} isAuthed={isAuthed} friends_requests_count={friends_requests_count} menuOpened={menuOpened} startLoading={startLoading} forDeskTop onMenuClick={setMenuOpened} />
            </nav>
        </header>
    )
}
