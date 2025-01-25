import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';

import { CurrentActiveRouteStateType, HasTokenStateType } from '../utils/constants';
import { set_current_active_route } from "../utils/store";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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

    useEffect(() => {
        setMenuOpened(false);
        dispatch(set_current_active_route(location.pathname));
    }, [dispatch, location.pathname])

    const CheckHead = () => {
        if (isAuthed) {
            return (
                <>
                    <ul>
                        <li>
                            <Link to="/" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/" ? 'active-head' : ''} d-flex gap-2`} id="home-nav" title="Home">
                                <HomeIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Home</p>
                            </Link>
                        </li>
                        <li>
                            <Link to="/social-user-profile" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/social-user-profile" ? 'active-head' : ''} d-flex gap-2`} title="Profile">
                                <PersonIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">My Profile</p>
                            </Link>
                        </li>
                        <li>
                            <Link to="/see-user-friends" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/see-user-friends" ? 'active-head' : ''} d-flex gap-2`} id="user-friends-nav" title="My Friends">
                                <PeopleIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">My Firends</p>
                            </Link>
                        </li>
                        <li>
                            <Link to="/social-friends" id="add-fr" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/social-friends" ? 'active-head' : ''} d-flex gap-2`} title="Add Friends">
                                <PersonAddIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Add Friends</p>
                            </Link>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <Link to="/AI-view" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/AI-view" ? 'active-head' : ''} d-flex gap-2`}>
                                <SupportAgentIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Support</p>
                            </Link>
                        </li>
                        <li>
                            <Link to="/user/settings" className={`nav-link ${menuOpened ? 'show' : ''} ${current_route === "/user/settings" ? 'active-head' : ''} d-flex gap-2`} title="Settings">
                                <SettingsIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Settings</p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                    // onclick="open_dialog(true, 'Are you sure you want to logout ?', 'logout')"
                                to='/logout' className={`nav-link ${menuOpened ? 'show' : ''}`} id="logout-nav" title="Logout">
                                <LogoutIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                                <p className="label-for m-0">Logout</p>
                            </Link>
                        </li>
                    </ul>
                </>
            )
        } else {
            return (
                <ul>
                    <li>
                        <Link to="/login" className={`nav-link ${menuOpened ? 'show' : ''}`} title="Login">
                            <LoginIcon sx={{ width: '1.9rem', height: '1.9rem' }} />
                            <p className="label-for m-0">Login</p>
                        </Link>
                    </li>
                    <li>
                        <Link to="/signup" className={`nav-link ${menuOpened ? 'show' : ''}`} title="Signup">
                            <i className="fa-solid fa-arrow-left"></i>
                            <p className="label-for m-0">Signup</p>
                        </Link>
                    </li>
                </ul>
            )
        }
    }

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
