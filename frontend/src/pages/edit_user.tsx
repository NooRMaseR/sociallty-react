import {
  ACCESS,
  MEDIA_URL,
  ApiUrls,
  FullUser,
  REFRESH,
  TokenResponse,
} from "../utils/constants";
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import FloatingLabelInput from "../components/floating_input_label";
import { LazyAvatar } from "../components/media_skelatons";
import { useLoadingBar } from "react-top-loading-bar";
import { useNavigate } from "react-router-dom";
import { setHasToken } from "../utils/store";
import { Box, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import api from "../utils/api";

import Person2Icon from "@mui/icons-material/Person2";
import Person3Icon from "@mui/icons-material/Person3";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CakeIcon from "@mui/icons-material/Cake";
import InfoIcon from "@mui/icons-material/Info";
import LockIcon from "@mui/icons-material/Lock";
import "../styles/signup.css";

export default function EditUserPage() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const [user, setUser] = useState<FullUser | null>(null);
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handelOnFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imgSrc = URL.createObjectURL(e.target.files[0]);
      if (avatarRef.current) avatarRef.current.src = imgSrc;
    }
  }, []);

  const handelOnSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const res = await api.put<TokenResponse>(ApiUrls.edit_user, formData);

      if (res.status === 200) {
        start();
        localStorage.setItem(ACCESS, res.data.access);
        localStorage.setItem(REFRESH, res.data.refresh);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("profile_picture", res.data.profile_picture);
        dispatch(setHasToken(true));
        navigate("/");
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
  }, [dispatch, navigate, start]);

  const getUserData = useCallback(async () => {
    try {
      const res = await api.get<FullUser>(ApiUrls.edit_user);

      if (res.status === 200) {
        setUser(res.data);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrors(error.response.data);
    }
    complete();
  }, [complete]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  return (
    <Box sx={{display: "flex", placeContent: 'center'}}>
      <Helmet>
        <title>Edit {localStorage.getItem("username") || "User"}</title>
        <meta property="og:image" content="/favicon.ico" />
        <meta property="og:title" content="Edit Post" />
        <meta property="og:description" content="Edit Your Post From Here" />
        <meta property="og:url" content={location.href} />
        <meta property="og:type" content="edit" />
      </Helmet>
      <form onSubmit={handelOnSubmit}>
        <div id="main-profile-container">
          <label htmlFor="pic-picker" id="pic-label">
            Choose profile picture
          </label>
          <div id="profile-container" onClick={() => filePickerRef.current?.click()}>
            <LazyAvatar
              src={`${MEDIA_URL}${user?.profile_picture ?? "/unknown.png"}`}
              slotProps={{ img: { ref: avatarRef } }}
              alt="user"
              sx={{ width: "7rem", height: "7rem", cursor: 'pointer' }}
            />
            <input
              type="file"
              ref={filePickerRef}
              name="profile_picture"
              id="pic-picker"
              accept="image/*"
              onChange={handelOnFileChange}
              style={{ display: "none", pointerEvents: "none" }}
            />
          </div>
        </div>
        <FloatingLabelInput
          type="text"
          name="first_name"
          label="First Name"
          autoComplete="cc-given-name"
          suffexIcon={<PersonIcon sx={{ color: "var(--text-color)" }} />}
          inputProps={{ defaultValue: user?.first_name }}
          required
        />
        <FloatingLabelInput
          type="text"
          name="last_name"
          label="Last Name"
          autoComplete="family-name"
          suffexIcon={<Person2Icon sx={{ color: "var(--text-color)" }} />}
          inputProps={{ defaultValue: user?.last_name }}
          required
        />
        <FloatingLabelInput
          type="text"
          name="username"
          label="User Name"
          autoComplete="username"
          suffexIcon={<Person3Icon sx={{ color: "var(--text-color)" }} />}
          inputProps={{ defaultValue: user?.username }}
          required
        />
        <FloatingLabelInput
          type="email"
          name="email"
          label="Email"
          autoComplete="username"
          suffexIcon={<EmailIcon sx={{ color: "var(--text-color)" }} />}
          inputProps={{ inputMode: "email", defaultValue: user?.email }}
          required
        />
        <FloatingLabelInput
          name="password"
          type="password"
          label="Password"
          suffexIcon={<LockIcon sx={{ color: "var(--text-color)" }} />}
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
          suffexIcon={<CakeIcon sx={{ color: "var(--text-color)" }} />}
          inputProps={{ defaultValue: user?.birth }}
          required
        />
        <FloatingLabelInput
          type="tel"
          name="phone"
          label="Phone Number"
          autoComplete="tel"
          suffexIcon={<PhoneIcon sx={{ color: "var(--text-color)" }} />}
          inputProps={{ inputMode: "tel", defaultValue: user?.phone }}
          required
        />
        <FloatingLabelInput
          name="bio"
          label="Bio"
          suffexIcon={<InfoIcon sx={{ color: "var(--text-color)" }} />}
          inputProps={{
            multiline: true,
            placeholder: "i'm a Social Person 😊😁....",
            defaultValue: user?.bio,
          }}
        />
        <Box sx={{ display: "flex", placeContent: "center" }}>
          {errors && (
            <ul>
              {errors.map((value, index) => (
                <li style={{ color: "red" }} key={index}>
                  {value}
                </li>
              ))}
            </ul>
          )}
        </Box>

        <Button type="submit" variant="contained" loading={loading} loadingPosition="start">
          {loading ? "Please wait...." : "Update"}
        </Button>
      </form>
    </Box>
  );
}
