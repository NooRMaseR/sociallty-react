import AccountCardSkelaton from "../components/account_card_skelaton";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import AccountCard from "../components/account_card";
import { FullUser } from "../utils/constants";
import api from "../utils/api";

export default function SocialFriendsPage() {
    document.title = "Social Friends";

    const [users, setUsers] = useState<FullUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonloading, setButtonLoading] = useState<boolean>(false);
    const [hasNext, setHasNext] = useState<boolean>(false);
    const [list, setList] = useState<number>(1);

    const getAccounts = useCallback(async () => {
        setButtonLoading(true);
        const res = await api.get<{users: FullUser[], has_next: boolean}>(`/social-users/?list=${list}`);
        if (res && res.status === 200) {
            setUsers((prev) => [...prev, ...res.data.users]);
            setLoading(false);
            setHasNext(res.data.has_next);
            setButtonLoading(false);
        }
    }, [list]);

    const CardsSkelaton = () => {
        const cards: ReactNode[] = [];
        for (let i = 0; i < 15; i++) {
            cards.push(<AccountCardSkelaton key={i} />);
        };

        return cards;
    }

    useEffect(() => {
        if (!buttonloading) getAccounts();
    }, [getAccounts]);

    return (
        <>
            <div className="cards-holder">
                {loading ? <CardsSkelaton /> : users.map((user) => <AccountCard user={user} key={user.id} forFriends={false} />)}
            </div>
            {hasNext && <Box sx={{display: 'flex', placeContent: 'center', marginBlock: '7rem'}}>
                <Button variant="contained" disabled={buttonloading} onClick={() => setList((prev) => prev + 1)}>{buttonloading ? <CircularProgress size={50} /> : 'Load More'}</Button>
            </Box>}
        </>
    );
};