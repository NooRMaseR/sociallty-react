import { useState } from 'react';
import '../styles/account_card.css'
import { Link } from "react-router-dom";
import { Avatar, Button } from "@mui/material";
import { API_URL, FullUser } from "../utils/constants";
import { addFriend, removeFriend } from '../utils/functions';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

export default function AccountCard({ user, forFriends = true }: { user: FullUser, forFriends?: boolean }) {
    const [toggleButton, setToggleButton] = useState<boolean>(forFriends);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // add a function to add/remove a friend

    const handelSendRemoveFriend = async () => {
        setIsLoading(true);
        if (!toggleButton) { // add
            const success = await addFriend(user.id);
            if (success) {
                setToggleButton(true);
            }
        } else { // remove
            const success = await removeFriend(user.id);
            if (success) {
                setToggleButton(false);
            }
        }
        setIsLoading(false);
    }
    
    return (
        <div className="card">
            <div className="left">
                <Avatar src={`${API_URL}${user.profile_picture}`} sx={{width: '4rem', height: "4rem"}} alt={`${user.first_name} ${user.last_name}`} />
                <div className="username">
                    <Link to="/profile-other?username=user.username&id=user.id">{user.username}</Link>
                </div>
            </div>
            <Button onClick={handelSendRemoveFriend} disabled={isLoading}>
                {
                    !toggleButton ? <PersonAddAlt1Icon className='right re' sx={{ width: '3rem', height: '3rem' }} titleAccess='Add' />
                        : <PersonRemoveIcon className='right' sx={{ width: '3rem', height: '3rem' }} titleAccess='Remove' />
                }
            </Button>
        </div>
    )
}