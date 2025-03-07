import { ChangeEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { ACCESS, ApiUrls, REFRESH, TokenResponse } from "../utils/constants";
import { Box, Button, Step, StepLabel, Stepper, Typography } from "@mui/material";
import FloatingLabelInput from "../components/floating_input_label";
import { LazyAvatar } from "../components/media_skelatons";
import { Link, useNavigate } from "react-router-dom";
import { setHasToken } from "../utils/store";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import api from "../utils/api";

import { useLoadingBar } from "react-top-loading-bar";
import Person2Icon from "@mui/icons-material/Person2";
import Person3Icon from "@mui/icons-material/Person3";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CakeIcon from "@mui/icons-material/Cake";
import InfoIcon from "@mui/icons-material/Info";
import LockIcon from "@mui/icons-material/Lock";
import { useForm } from "react-hook-form";
import "../styles/signup.css";

interface UserSignupProps {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  bio: string;
  phone: string;
  birth: Date;
  profile_picture: File;
}

export default function Signup() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const avatarRef = useRef<HTMLImageElement>(null);
  const { register, handleSubmit, setValue } = useForm<UserSignupProps>();
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  
  const getMinErrorStep = useCallback((errors: Record<string, string>): number => {
    const fieldsStepNumbers = {
      first_name: 0,
      last_name: 0,
      username: 0,
      email: 1,
      password: 1,
      bio: 2,
      phone: 2,
      birth: 2,
    };
    const set = new Set<number>();
    for (const key of Object.keys(errors)) {
      const fieldKey = key as keyof typeof fieldsStepNumbers;
      set.add(fieldsStepNumbers[fieldKey]);
    }
    return Math.min(...Array.from(set));
  }, []);

  const handelOnFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imgSrc = URL.createObjectURL(e.target.files[0]);
      if (avatarRef.current) avatarRef.current.src = imgSrc;
      setValue("profile_picture", e.target.files[0]);
    }
  }, [setValue]);

  const handelOnSubmit = useCallback(async (e: UserSignupProps) => {
    setLoading(true);
    const er: Record<string, string> = {};
    try {
      for (const [key, value] of Object.entries(e)) {
        if (!value) {
          er[key] = "This field is Required.";
        }
      }

      setErrors(er);

      if (er.length as unknown as number > 0) {
        setActiveStep(getMinErrorStep(er));
        return;
      }
      const res = await api.put<TokenResponse>(
        ApiUrls.user_log_sign,
        { ...e },
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status === 200) {
        start();
        localStorage.setItem(ACCESS, res.data.access);
        localStorage.setItem(REFRESH, res.data.refresh);
        localStorage.setItem("id", res.data.id.toString());
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("profile_pic", res.data.profile_picture);
        dispatch(setHasToken(true));
        navigate("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.status === 400) {
        const errorsNow: Record<string, string> = {};
        for (const [key, value] of Object.entries<string>(
          error.response.data
        )) {
          errorsNow[key] = Array.isArray(value) ? value.join(" and ") : value;
        }

        setErrors(errorsNow);
        setActiveStep(getMinErrorStep(errorsNow));
      } else {
        setErrors({ error: "Somthing went wrong, please try Again." });
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, getMinErrorStep, navigate, start]);

  useEffect(() => {
    complete();
  }, [complete]);

  const handelNextStep = () => setActiveStep(activeStep + 1);
  const handelPrevStep = () => setActiveStep(activeStep - 1);

  const Steps = memo(() => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <div id="main-profile-container">
              <Typography component="label" htmlFor="pic-picker" id="pic-label">
                Click To Choose Profile Picture
              </Typography>
              <div
                id="profile-container"
                onClick={() => document.getElementById("pic-picker")?.click()}
              >
                <LazyAvatar
                  src="/unknown.png"
                  slotProps={{ img: { ref: avatarRef } }}
                  alt="user"
                  width="7rem"
                  height="7rem"
                />
                <input
                  type="file"
                  id="pic-picker"
                  {...register("profile_picture")}
                  accept="image/*"
                  onChange={handelOnFileChange}
                  style={{ display: "none", pointerEvents: "none" }}
                />
              </div>
            </div>
            <FloatingLabelInput
              type="text"
              label="First Name"
              autoComplete="cc-given-name"
              suffexIcon={<PersonIcon sx={{ color: "#fff" }} />}
              inputProps={{
                ...register("first_name"),
                error: !!errors.first_name,
                helperText: errors.first_name,
              }}
              required
            />
            <FloatingLabelInput
              type="text"
              label="Last Name"
              autoComplete="family-name"
              suffexIcon={<Person2Icon sx={{ color: "#fff" }} />}
              inputProps={{
                ...register("last_name"),
                error: !!errors.last_name,
                helperText: errors.last_name,
              }}
              required
            />
            <FloatingLabelInput
              type="text"
              label="User Name"
              autoComplete="username"
              suffexIcon={<Person3Icon sx={{ color: "#fff" }} />}
              inputProps={{
                ...register("username"),
                error: !!errors.username,
                helperText: errors.username,
              }}
              required
            />
          </>
        );
      case 1:
        return (
          <>
            <FloatingLabelInput
              type="email"
              label="Email"
              autoComplete="email"
              suffexIcon={<EmailIcon sx={{ color: "#fff" }} />}
              inputProps={{
                inputMode: "email",
                ...register("email"),
                error: !!errors.email,
                helperText: errors.email,
              }}
              required
            />
            <FloatingLabelInput
              type="password"
              label="Password"
              suffexIcon={<LockIcon sx={{ color: "var(--text-color)" }} />}
              autoComplete="current-password"
              inputProps={{
                ...register("password"),
                error: !!errors.password,
                helperText: errors.password,
              }}
              slotProps={{
                htmlInput: {
                  minLength: 8,
                },
              }}
              required
            />
          </>
        );

      case 2:
        return (
          <>
            <FloatingLabelInput
              type="date"
              suffexIcon={<CakeIcon sx={{ color: "#fff" }} />}
              inputProps={{
                ...register("birth"),
                error: !!errors.birth,
                helperText: errors.birth,
              }}
              required
            />
            <FloatingLabelInput
              type="tel"
              label="Phone Number"
              autoComplete="tel"
              suffexIcon={<PhoneIcon sx={{ color: "#fff" }} />}
              inputProps={{
                inputMode: "tel",
                ...register("phone"),
                error: !!errors.phone,
                helperText: errors.phone,
              }}
              required
            />
            <FloatingLabelInput
              label="Bio"
              suffexIcon={<InfoIcon sx={{ color: "#fff" }} />}
              inputProps={{
                multiline: true,
                placeholder: "i'm a Social Person 😊😁....",
                ...register("bio"),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              loading={loading}
              loadingPosition="start"
            >
              {loading ? "Please wait...." : "Get Started"}
            </Button>
          </>
        );

      default:
        break;
    }
  });

  return (
    <Box
      className="d-flex"
      sx={{ flexDirection: "column", placeItems: "center", width: "100%" }}
    >
      <Helmet>
        <title>Sign Up</title>
        <meta
          name="description"
          content="Don't Have Account? Create One Now and Join Social commounty"
        />
      </Helmet>
      <Stepper alternativeLabel activeStep={activeStep} sx={{ width: "100%" }}>
        <Step>
          <StepLabel error={!!errors.first_name || !!errors.last_name || !!errors.username}>Basic Info</StepLabel>
        </Step>
        <Step>
          <StepLabel error={!!errors.email || !!errors.password}>Login Info</StepLabel>
        </Step>
        <Step>
          <StepLabel error={!!errors.phone || !!errors.birth}>Additinal Info</StepLabel>
        </Step>
      </Stepper>

      <form onSubmit={handleSubmit(handelOnSubmit)}>
        <Steps />
        {errors && (
          <ul>
            {Object.entries(errors).map(
              ([key, value]) =>
                key === "error" && (
                  <li style={{ color: "red" }} key={key}>
                    {value}
                  </li>
                )
            )}
          </ul>
        )}

        {activeStep !== 2 && (
          <Button variant="contained" onClick={handelNextStep}>
            Next
          </Button>
        )}
        <Button disabled={activeStep === 0} onClick={handelPrevStep}>
          Back
        </Button>
        <Link to="/login" onClick={() => start()} className="link" id="login-btn">
          Already Have Account ?
        </Link>
      </form>
    </Box>
  );
}
