import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';

import { CurrentActiveRouteStateType, FriendsRequestsCountStateType, HasTokenStateType } from '../utils/constants';
import { memo, useCallback, useEffect, useState } from "react";
import { set_current_active_route } from "../utils/store";
import { useSelector, useDispatch } from "react-redux";
import { useLoadingBar } from "react-top-loading-bar";
import { Link, useLocation } from "react-router-dom";
import { Badge, Tooltip } from '@mui/material';
import '../styles/nav.css'

interface CheckHeadProps {
    current_route: string;
    menuOpened: boolean;
    isAuthed: boolean;
    friends_requests_count: number;
    startLoading: () => void;
}

const CheckHead = memo(({isAuthed, current_route, menuOpened, friends_requests_count, startLoading}: CheckHeadProps) => {
    if (isAuthed) {
        return (
            <>
                <ul>
                    <li>
                        <Tooltip title='Home'>
                            <Link to="/" onClick={startLoading} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/" ? 'active-head' : ''} d-flex gap-2`} id="home-nav">
                                <HomeIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Home</p>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Profile">
                            <Link to="/social-user-profile" onClick={startLoading} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/social-user-profile" ? 'active-head' : ''} d-flex gap-2`}>
                                <PersonIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">My Profile</p>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Friends Requests">
                            <Link to="/see-friends-requests" onClick={startLoading} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/see-friends-requests" ? 'active-head' : ''} d-flex gap-2`} id="user-friends-nav">
                                <Badge badgeContent={friends_requests_count} color='primary'>
                                    <GroupAddIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                </Badge>
                                <p className="label-for m-0">Firends Requests</p>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="My Friends">
                            <Link to="/see-user-friends" onClick={startLoading} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/see-user-friends" ? 'active-head' : ''} d-flex gap-2`} id="user-friends-nav">
                                <PeopleIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">My Firends</p>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Add Friends">
                            <Link to="/social-friends" onClick={startLoading} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/social-friends" ? 'active-head' : ''} d-flex gap-2`}>
                                <PersonAddIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Add Friends</p>
                            </Link>
                        </Tooltip>
                    </li>
                </ul>
                <ul>
                    <li>
                        <Tooltip title="Settings">
                            <Link to="/user/settings" onClick={startLoading} className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/user/settings" ? 'active-head' : ''} d-flex gap-2`}>
                                <SettingsIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Settings</p>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Logout">
                            <Link to='/logout' onClick={startLoading} className={`nav-link ${menuOpened ? 'show' : ''}`} id="logout-nav">
                                <LogoutIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Logout</p>
                            </Link>
                        </Tooltip>
                    </li>
                </ul>
            </>
        )
    } else if (current_route !== "/login") {
        return (
            <ul>
                <li>
                    <Tooltip title="Login">
                        <Link to="/login" onClick={startLoading} className={`nav-link ${menuOpened ? 'show' : ''}`}>
                            <LoginIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                            <p className="label-for m-0">Login</p>
                        </Link>
                    </Tooltip>
                </li>
            </ul>
        )
    }
});
export default function Header() {
    const [menuOpened, setMenuOpened] = useState<boolean>(false);
    const dispatch = useDispatch();
    const location = useLocation();
    const { start } = useLoadingBar({
        color: "blue",
        height: 2,
    });
    
    const isAuthed = useSelector(
        (state: HasTokenStateType) => state.hasToken.value
    );
    const current_route = useSelector(
        (state: CurrentActiveRouteStateType) => state.current_active_route.value
    );
    const friends_requests_count = useSelector(
        (state: FriendsRequestsCountStateType) => state.friends_requests_count.count
    );


    useEffect(() => {
        setMenuOpened(false);
        dispatch(set_current_active_route(location.pathname));
    }, [dispatch, location.pathname])

    const startLoading = useCallback(() => start(), [start]);


    return (
        <header>
            
            <nav className={menuOpened ? 'show-nav' : ''}>
                <h4 id="title">Sociallty</h4>
                <CheckHead current_route={current_route} isAuthed={isAuthed} friends_requests_count={friends_requests_count} menuOpened={menuOpened} startLoading={startLoading} />
                <svg className={`ham hamRotate ham8 ${menuOpened && 'active'}`} id="menu" viewBox="0 0 100 100" width="80" onClick={() => setMenuOpened(!menuOpened)}>
                    <path className="line top"
                        d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20" />
                    <path className="line middle" d="m 30,50 h 40" />
                    <path className="line bottom"
                        d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20" />
                </svg>
            </nav>
        </header>
    )
}
