import AccountCardSkelaton from "../components/account_card_skelaton";
import { ReactNode, useEffect, useState } from "react";
import AccountCard from "../components/account_card";
import { FullUser } from "../utils/constants";
import { Box, Button } from "@mui/material";
import api from "../utils/api";

export default function SeeUserFriendsPage() {
    document.title = "My Friends";

    const [users, setUsers] = useState<FullUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getAccounts = async () => {
        setError(null);
        try {
            const res = await api.get<{users: FullUser[], has_next: boolean}>('/see-user-friends/');
            if (res && res.status === 200) {
                setUsers(res.data.users);
                setLoading(false);
            };
        } catch {
            setError("somthing went wrong while getting your friends, please refresh the page");
        }
    };

    const CardsSkelaton = () => {
        const cards: ReactNode[] = [];
        for (let i = 0; i < 10; i++) {
            cards.push(<AccountCardSkelaton key={i} />);
        };

        return cards;
    }
    

    useEffect(() => {
        getAccounts();
    }, []);

    return error ? <h1 className="text-white">{error}</h1> : (
        <>
            <div className="cards-holder">
                {loading ? <CardsSkelaton /> : users.map((user) => <AccountCard user={user} key={user.id} forFriends={true} />)}
            </div>
            <Box sx={{ display: 'flex', placeContent: 'center', mt: '7rem' }}>
                <Button variant="contained">Load More</Button>
            </Box>
        </>
    )
};