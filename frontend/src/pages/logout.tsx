import { setHasToken } from "../utils/store";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

export default function Logout() {
    const dispatch = useDispatch();

    useEffect(() => {
        localStorage.clear();
        dispatch(setHasToken(false));
    }, [dispatch]);

    return <Navigate to='/login' />
}