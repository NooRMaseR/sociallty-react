import { Skeleton } from "@mui/material";

export default function AccountCardSkelaton() {
    return (
        <div className="card">
            <div className="left">
                <Skeleton variant="circular" width='4rem' height='4rem' />
                <div className="username">
                    <Skeleton variant="text" width='4rem' height='1rem' />
                </div>
            </div>
            <Skeleton variant="rounded" width='4rem' height='4rem' />
        </div>
    )
}