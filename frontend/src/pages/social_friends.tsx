import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import AccountCardSkelaton from "../components/account_card_skelaton";
import { ApiUrls, FullUser } from "../utils/constants";
import AccountCard from "../components/account_card";
import { Box, Button } from "@mui/material";
import { Helmet } from "react-helmet";
import api from "../utils/api";

export default function SocialFriendsPage() {
    const [users, setUsers] = useState<FullUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [buttonloading, setButtonLoading] = useState<boolean>(false);
    const [hasNext, setHasNext] = useState<boolean>(false);
    const [list, setList] = useState<number>(1);

    const getAccounts = useCallback(async () => {
        setButtonLoading(true);
        const res = await api.get<{users: FullUser[], has_next: boolean}>(ApiUrls.social_users + `?list=${list}`);
        if (res && res.status === 200) {
            setUsers((prev) => [...prev, ...res.data.users]);
            setLoading(false);
            setHasNext(res.data.has_next);
            setButtonLoading(false);
        }
    }, [list]);

    const CardsSkelaton = memo(() => {
        const cards: ReactNode[] = [];
        for (let i = 0; i < 15; i++) {
            cards.push(<AccountCardSkelaton key={i} />);
        };

        return cards;
    });

    useEffect(() => {
        if (!buttonloading) getAccounts();
    }, [getAccounts]);

    return (
        <>
            <Helmet>
                <title>Social Friends</title>
                <meta name="description" content="Find and connect with Social Friends in Sociallty" />
            </Helmet>
            <div className="cards-holder">
                {loading ? <CardsSkelaton /> : users.map((user) => <AccountCard user={user} key={user.id} forFriends={false} />)}
            </div>
            {hasNext ? <Box sx={{display: 'flex', placeContent: 'center', marginBlock: '7rem'}}>
                <Button variant="contained" loading={buttonloading} loadingPosition="start" onClick={() => setList((prev) => prev + 1)}>
                    {buttonloading ? 'Please wait...' : 'Load More'}</Button>
            </Box> : <p>No More Users...</p>}
        </>
    );
};