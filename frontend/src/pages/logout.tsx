import { useDispatch } from "react-redux";
import { setHasToken } from "../utils/store";
import { Navigate } from "react-router-dom";

export default function Logout() {
    const dispatch = useDispatch();
    localStorage.clear();
    dispatch(setHasToken(false));

    return <Navigate to='/login' />
}