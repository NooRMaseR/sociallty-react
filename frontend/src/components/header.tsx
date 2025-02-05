import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';

import { CurrentActiveRouteStateType, FriendsRequestsCountStateType, HasTokenStateType } from '../utils/constants';
import { set_current_active_route } from "../utils/store";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { memo, useEffect, useState } from "react";
import { Badge, Tooltip } from '@mui/material';
import '../styles/nav.css'

export default function Header() {
    const [menuOpened, setMenuOpened] = useState<boolean>(false);
    const dispatch = useDispatch();
    const location = useLocation();
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

    const CheckHead = memo(() => {
        if (isAuthed) {
            return (
                <>
                    <ul>
                        <li>
                            <Tooltip title='Home'>
                                <Link to="/" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/" ? 'active-head' : ''} d-flex gap-2`} id="home-nav">
                                    <HomeIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                    <p className="label-for m-0">Home</p>
                                </Link>
                            </Tooltip>
                        </li>
                        <li>
                            <Tooltip title="Profile">
                                <Link to="/social-user-profile" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/social-user-profile" ? 'active-head' : ''} d-flex gap-2`}>
                                    <PersonIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                    <p className="label-for m-0">My Profile</p>
                                </Link>
                            </Tooltip>
                        </li>
                        <li>
                            <Tooltip title="Friends Requests">
                                <Link to="/see-friends-requests" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/see-friends-requests" ? 'active-head' : ''} d-flex gap-2`} id="user-friends-nav">
                                    <Badge badgeContent={friends_requests_count} color='primary'>
                                        <GroupAddIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                    </Badge>
                                    <p className="label-for m-0">Firends Requests</p>
                                </Link>
                            </Tooltip>
                        </li>
                        <li>
                            <Tooltip title="My Friends">
                                <Link to="/see-user-friends" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/see-user-friends" ? 'active-head' : ''} d-flex gap-2`} id="user-friends-nav">
                                    <PeopleIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                    <p className="label-for m-0">My Firends</p>
                                </Link>
                            </Tooltip>
                        </li>
                        <li>
                            <Tooltip title="Add Friends">
                                <Link to="/social-friends" id="add-fr" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/social-friends" ? 'active-head' : ''} d-flex gap-2`}>
                                    <PersonAddIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                    <p className="label-for m-0">Add Friends</p>
                                </Link>
                            </Tooltip>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <Tooltip title="Support">
                                <Link to="/AI-view" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/AI-view" ? 'active-head' : ''} d-flex gap-2`}>
                                    <SupportAgentIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                    <p className="label-for m-0">Support</p>
                                </Link>
                            </Tooltip>
                        </li>
                        <li>
                            <Tooltip title="Settings">
                                <Link to="/user/settings" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/user/settings" ? 'active-head' : ''} d-flex gap-2`}>
                                    <SettingsIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                    <p className="label-for m-0">Settings</p>
                                </Link>
                            </Tooltip>
                        </li>
                        <li>
                            <Tooltip title="Logout">
                                <Link to='/logout' className={`nav-link ${menuOpened ? 'show' : ''}`} id="logout-nav">
                                    <LogoutIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                    <p className="label-for m-0">Logout</p>
                                </Link>
                            </Tooltip>
                        </li>
                    </ul>
                </>
            )
        } else {
            return (
                <ul>
                    <li>
                        <Tooltip title="Login">
                            <Link to="/login" className={`nav-link ${menuOpened ? 'show' : ''}`}>
                                <LoginIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Login</p>
                            </Link>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip title="Signup">
                            <Link to="/signup" className={`nav-link ${menuOpened ? 'show' : ''}`}>
                                <i className="fa-solid fa-arrow-left"></i>
                                <p className="label-for m-0">Signup</p>
                            </Link>
                        </Tooltip>
                    </li>
                </ul>
            )
        }
    });

    return (
        <header>
            <nav className={menuOpened ? 'show-nav' : ''}>
                <h4 id="title">Sociallty</h4>
                <CheckHead />
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
