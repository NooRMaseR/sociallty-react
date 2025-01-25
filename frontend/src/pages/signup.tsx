import { ACCESS, ApiUrls, REFRESH, TokenResponse } from "../utils/constants";
import FloatingLabelInput from "../components/floating_input_label";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button } from "@mui/material";
import { setHasToken } from "../utils/store";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import api from "../utils/api";

import Person2Icon from "@mui/icons-material/Person2";
import Person3Icon from "@mui/icons-material/Person3";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from "@mui/icons-material/Lock";
import '../styles/signup.css';

export default function Signup() {
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const filePickerRef = useRef<HTMLInputElement>(null);
    const avatarRef = useRef<HTMLImageElement>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handelOnFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const imgSrc = URL.createObjectURL(e.target.files[0]);
            if (avatarRef.current) avatarRef.current.src = imgSrc;
        }
    }

    const handelOnSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors([]);
        const formData = new FormData(e.target as HTMLFormElement);
        try {
            const res = await api.put<TokenResponse>(ApiUrls.user_log_sign, formData);

            if (res.status === 200) {
                localStorage.setItem(ACCESS, res.data.access);
                localStorage.setItem(REFRESH, res.data.refresh);
                localStorage.setItem('id', res.data.id.toString());
                localStorage.setItem('username', res.data.username);
                dispatch(setHasToken(true));
                navigate('/');
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.response.status === 400) {
                setErrors(Object.values(error.response.data));
            } else {
                setErrors(["Somthing went wrong, please try Again."]);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div id="container">
            <Helmet>
                <title>Sign Up</title>
                <meta name="description" content="Don't Have Account? Create One Now and Join Social commounty" />
            </Helmet>
            <form onSubmit={handelOnSubmit}>
                <div id="main-profile-container">
                    <label htmlFor="pic-picker" id="pic-label">Choose profile picture</label>
                    <div id="profile-container" onClick={() => filePickerRef.current?.click()}>
                        <Avatar src="/unknown.png" slotProps={{img: {ref: avatarRef}}} alt="user" sx={{width: '7rem', height: '7rem'}} />
                        <input type="file" ref={filePickerRef} name="profile_picture" id="pic-picker" accept="image/*" onChange={handelOnFileChange} style={{display: 'none', pointerEvents: 'none'}} />
                    </div>
                </div>
                <div className="field">
                    <div id="user-name-info">
                        <FloatingLabelInput
                            type="text"
                            name="first_name"
                            label="First Name"
                            autoComplete="cc-given-name"
                            suffexIcon={<PersonIcon sx={{ color: '#fff' }} />}
                            required
                        />
                        <FloatingLabelInput
                            type="text"
                            name="last_name"
                            label="Last Name"
                            autoComplete="family-name"
                            suffexIcon={<Person2Icon sx={{ color: '#fff' }} />}
                            required
                        />
                    </div>
                </div>
                <FloatingLabelInput
                    type="text" 
                    name="username" 
                    label="User Name" 
                    autoComplete="username"
                    suffexIcon={<Person3Icon sx={{ color: '#fff' }} />}
                    required
                />
                <FloatingLabelInput
                    type="email"
                    name="email"
                    label="Email" 
                    autoComplete="username"
                    suffexIcon={<EmailIcon sx={{ color: '#fff' }} />}
                    inputProps={{inputMode:"email"}}
                    required
                />
                <FloatingLabelInput
                    name="password"
                    type="password"
                    label="Password"
                    suffexIcon={<LockIcon sx={{ color: "#fff" }} />}
                    autoComplete="password"
                    slotProps={{
                        htmlInput: {
                            minLength: 8,
                        },
                    }}
                    required
                />
                <FloatingLabelInput
                    type="date"
                    name="birth" 
                    suffexIcon={<CakeIcon sx={{ color: '#fff' }} />}
                    required
                />
                <FloatingLabelInput
                    type="tel"
                    name="phone" 
                    label="Phone Number"
                    autoComplete="tel"
                    suffexIcon={<PhoneIcon sx={{ color: '#fff' }} />}
                    inputProps={{inputMode: 'tel'}}
                    required
                />
                <FloatingLabelInput
                    name="bio"
                    label="Bio"
                    suffexIcon={<InfoIcon sx={{ color: '#fff' }} />}
                    inputProps={{multiline: true, placeholder:"i'm a Social Person 😊😁...."}}
                />
                {errors &&
                    <ul>
                        {errors.map((value, index) => <li style={{ color: 'red' }} key={index}>{value}</li>)}
                    </ul>
                }
                {/* {loading && <CircularProgress />} */}

                <Button type="submit" variant="contained" loading={loading} loadingPosition="start">
                    {loading ? 'Please wait....' : "Get Started"}
                </Button>
                <Link to="/login" className="link" id="login-btn">Already Have Account ?</Link>
            </form>
        </div>
    )
}