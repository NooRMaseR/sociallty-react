import { useDispatch, useSelector } from "react-redux";
import { ACCESS, REFRESH } from "../utils/constants";
import { CircularProgress } from "@mui/material";
import { ReactNode, useEffect } from "react";
import { setHasToken } from "../utils/store";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../utils/api";


export default function ProtectedView({ children }: { children: ReactNode }) {
    
    // const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
    const isAuthed = useSelector(
        (state: { hasToken: { value: boolean } }) => state.hasToken.value
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
                await refresh_token();
            } else {
                dispatch(setHasToken(true));
            }
        } catch {
            dispatch(setHasToken(false));
        }
        
    };

    const refresh_token = async () => {
        const refresh = localStorage.getItem(REFRESH);
        try {
            const res = await api.post('/user/refresh/', {
                refresh
            });
            
            if (res.status == 200) {
                localStorage.setItem(ACCESS, res.data.access);
                dispatch(setHasToken(true));
                return;
            }
            
            dispatch(setHasToken(false));
        } catch {
            dispatch(setHasToken(false));
        }
    };

    if (isAuthed === null) {
        return <CircularProgress />
    };

    return isAuthed ? children : <Navigate to='/login'/>

}

