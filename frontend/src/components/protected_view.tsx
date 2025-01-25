import { ACCESS, HasTokenStateType} from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { ReactNode, useEffect } from "react";
import { refresh_token } from "../utils/api";
import { setHasToken } from "../utils/store";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


export default function ProtectedView({ children }: { children: ReactNode }) {
    
    const isAuthed = useSelector(
        (state: HasTokenStateType) => state.hasToken.value
    );
    const dispatch = useDispatch();

    useEffect(() => {
        auth();
    })

    const auth = async () => {
        try {
            const token = localStorage.getItem(ACCESS);
            
            if (!token) {
                dispatch(setHasToken(false));
                return;
            } 
            const timeNow = Date.now() / 1000
            const userAccessToken = jwtDecode(token);
            const exp = userAccessToken.exp;
            
            if (!exp) {
                dispatch(setHasToken(false));
                return
            }
            
            if (exp < timeNow) {
                try {
                    if (await refresh_token()) dispatch(setHasToken(true));
                    else dispatch(setHasToken(false));
                } catch {
                    dispatch(setHasToken(false));
                }
            } else {
                dispatch(setHasToken(true));
            }
        } catch {
            dispatch(setHasToken(false));
        }
        
    };

    if (isAuthed === null) {
        return <CircularProgress />
    };

    return isAuthed ? children : <Navigate to='/login'/>

}

