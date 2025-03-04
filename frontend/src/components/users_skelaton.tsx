import { memo } from "react";
import AccountCardSkelaton from "./account_card_skelaton";

export const CardsSkelaton = memo(() =>
  Array.from({ length: 10 }).map((_, i) => <AccountCardSkelaton key={i} />)
);

export default function UsersSkelaton() {
    return (
        <>
            <div className="cards-holder">
                <CardsSkelaton />
            </div>
        </>
    )
}