import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FloatingLabelInput from "../components/floating_input_label";
import { ApiUrls, TokenResponse } from "../utils/constants";
import { Avatar, Box, Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { setEmail } from "../utils/store";
import { Helmet } from "react-helmet";
import api from "../utils/api";

export default function ForgetPasswordPage() {
    const [userEmail, setUserEmail] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const handelOnSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
        const res = await api.post<TokenResponse>(ApiUrls.forget_password, {
            email: userEmail,
        });
    
        if (res && res.status == 200) {
            dispatch(setEmail(userEmail));
            navigate("/user/verify-code");
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            if (error.response.status === 400) {
                setError(Object.values<string>(error.response.data)[0]);
            } else {
                setError("Somthing went wrong, please try Again.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div id="container">
            <Helmet>
                <title>Forget Password</title>
                <meta name="description" content="Forget Your Password ?, Authenticate To Change your Password Now." />
            </Helmet>
            <form onSubmit={handelOnSubmit}>
                <Button sx={{float: 'left', width: 'fit-content'}} onClick={() => navigate('/login')}><ArrowBackRoundedIcon /></Button>
                <Box id="header">
                    <h1 id="pic-label">Forget Password</h1>
                    <Avatar src="/favicon.png" sx={{ width: "10rem", height: "10rem" }} />
                </Box>
                <FloatingLabelInput
                    name="email"
                    type="email"
                    label="Email"
                    updater={setUserEmail}
                    suffexIcon={<EmailIcon sx={{ color: "#fff" }} />}
                    autoComplete="email"
                    required
                />
                {error && <p style={{color: 'red'}}>{error}</p>}
                <Button type="submit" variant="contained" loading={loading} loadingPosition="start" sx={{ width: "100%", marginTop: "1rem" }}>
                    {loading ? 'Please wait....' : "Send Email"}
                </Button>
            </form>
        </div>
    );
}