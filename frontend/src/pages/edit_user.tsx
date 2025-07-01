import { ACCESS, MEDIA_URL, ApiUrls, FullUser, REFRESH, TokenResponse} from "../utils/constants";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import FloatingLabelInput from "../components/floating_input_label";
import { PasswordField } from "../components/password_field";
import { LazyAvatar } from "../components/media_skelatons";
import { Box, Button, MenuItem } from "@mui/material";
import { useLoadingBar } from "react-top-loading-bar";
import { useNavigate } from "react-router-dom";
import { setHasToken } from "../utils/store";
import { UserSignupProps } from "./signup";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";
import api from "../utils/api";

import Person2Icon from "@mui/icons-material/Person2";
import Person3Icon from "@mui/icons-material/Person3";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CakeIcon from "@mui/icons-material/Cake";
import InfoIcon from "@mui/icons-material/Info";
import WcIcon from '@mui/icons-material/Wc';
import "../styles/signup.css";

export default function EditUserPage() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const avatarRef = useRef<HTMLImageElement>(null);
  const [user, setUser] = useState<FullUser | null>(null);
  const { start, complete } = useLoadingBar();
  const { register, handleSubmit, setValue, reset } = useForm<UserSignupProps>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handelOnFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imgSrc = URL.createObjectURL(e.target.files[0]);
      if (avatarRef.current) avatarRef.current.src = imgSrc;
      setValue("profile_picture", e.target.files[0]);
    }
  }, [setValue]);

  const handelOnFormSubmit = useCallback(async (e: UserSignupProps) => {
    setLoading(true);
    setErrors([]);
    const formData = new FormData();
    
    Object.keys(e).forEach(key => {
      const typedKey = key as keyof UserSignupProps;
      
      if (key == "profile_picture") {
        
        if ((e[typedKey] as File)?.name?.length > 0) {
          formData.set(key, e[typedKey] as Blob | string);
        }
      } else {
        formData.set(key, e[typedKey] as Blob | string);
      }
    });

    try {
      const res = await api.put<TokenResponse>(ApiUrls.edit_user, formData);

      if (res.status === 200) {
        start();
        localStorage.setItem(ACCESS, res.data.access);
        localStorage.setItem(REFRESH, res.data.refresh);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("profile_pic", res.data.profile_picture);
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
      const res = await api.get<FullUser>(ApiUrls.edit_user)
      
      if (res.status === 200) {
        setUser(res.data);
        const data: Partial<UserSignupProps> = {}
        Object.keys(res.data).forEach((key) => {
          const userKey = key as keyof UserSignupProps;
          if (!["password", "id", "is_active", "is_staff", "is_superuser", "created_at", "last_login", "groups", "user_permissions", "profile_picture"].includes(key)) {
            setValue(userKey, res.data[userKey]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data[userKey] = res.data[userKey] as any;
          }
          reset(data);
        });
        
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("error: ", error);
      
      setErrors(error.response.data);
    }
    complete();
  }, []);

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
      <form onSubmit={handleSubmit(handelOnFormSubmit)} encType="multipart">
        <div id="main-profile-container">
          <label htmlFor="pic-picker" id="pic-label">
            Choose profile picture
          </label>
          <div id="profile-container" onClick={() => document.getElementById("pic-picker")?.click()}>
            <LazyAvatar
              src={`${MEDIA_URL}${user?.profile_picture ?? "/unknown.png"}`}
              slotProps={{ img: { ref: avatarRef } }}
              alt="user"
              width="10rem"
              height="10rem"
              sx={{ width: "10rem", height: "10rem", cursor: 'pointer' }}
            />
            <input
              type="file"
              id="pic-picker"
              accept="image/*"
              {...register("profile_picture")}
              onChange={handelOnFileChange}
              style={{ display: "none", pointerEvents: "none" }}
            />
          </div>
        </div>
        <FloatingLabelInput
          type="text"
          label="First Name"
          autoComplete="cc-given-name"
          preffexIcon={<PersonIcon sx={{ color: "var(--text-color)" }} />}
          {...register("first_name", {required: true})}
          
          required
        />
        <FloatingLabelInput
          type="text"
          label="Last Name"
          autoComplete="family-name"
          preffexIcon={<Person2Icon sx={{ color: "var(--text-color)" }} />}
          {...register("last_name", {required: true})}
          required
        />
        <FloatingLabelInput
          type="text"
          label="User Name"
          autoComplete="username"
          preffexIcon={<Person3Icon sx={{ color: "var(--text-color)" }} />}
          {...register("username", {required: true})}
          required
        />
        <FloatingLabelInput
          type="email"
          label="Email"
          autoComplete="email"
          preffexIcon={<EmailIcon sx={{ color: "var(--text-color)" }} />}
          {...register("email", {required: true})}
          inputProps={{ inputMode: "email" }}
          required
        />
        <PasswordField {...register("password", {required: true})}/>
        <FloatingLabelInput
          type="date"
          preffexIcon={<CakeIcon sx={{ color: "var(--text-color)" }} />}
          {...register("birth", {required: true})}
          required
        />
        <FloatingLabelInput
          type="tel"
          label="Phone Number"
          autoComplete="tel"
          preffexIcon={<PhoneIcon sx={{ color: "var(--text-color)" }} />}
          {...register("phone", {required: true})}
          inputProps={{ inputMode: "tel" }}
          required
        />
        <FloatingLabelInput
          label="Bio"
          preffexIcon={<InfoIcon sx={{ color: "var(--text-color)" }} />}
          {...register("bio", {required: true})}
          inputProps={{
            multiline: true,
            placeholder: "i'm a Social Person 😊😁....",
          }}
        />
        <FloatingLabelInput
          label="Gender"
          preffexIcon={<WcIcon sx={{ color: "var(--text-color)" }} />}
          {...register("gender", { required: true})}
          value={user?.gender ?? "male"}
          select
          required
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </FloatingLabelInput>
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
