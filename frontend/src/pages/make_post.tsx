import { ApiUrls, PostFormProps, Visibility } from "../utils/constants";
import FloatingLabelInput from "../components/floating_input_label";
import { memo, useCallback, useEffect, useState } from "react";
import { useLoadingBar } from "react-top-loading-bar";
import { Box, Button, MenuItem } from "@mui/material";
import { Image } from "../components/media_skelatons";
import FilePicker from "../components/file_picker";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";
import api from "../utils/api";

const MediaComponent = memo(({media}: {media: {type: string, src: string}[]}) => media.map((value) => {
  if (value.type.includes('image')) {
    return <Image src={value.src} key={value.src} style={{maxWidth: '90%'}} />
  } else if (value.type.includes('video')) {
    return <video src={value.src} key={value.src} style={{maxWidth: '90%'}} controls></video>
  }
}))

export default function MakePostPage() {
  const { register, handleSubmit, setValue } = useForm<PostFormProps>();
  const [loading, setLoading] = useState<boolean>(false);
  const [media, setMedia] = useState<{type: string, src: string}[]>([]);
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();

  const formSubmit = useCallback(async (data: PostFormProps) => {
    setLoading(true);
    const form_data = new FormData();
    form_data.append("desc", data.desc);
    form_data.append("visibility", data.visibility);
    data?.files?.forEach((file) => form_data.append("files", file));

    try {
      const res = await api.post(ApiUrls.post, form_data);

      if (res.status === 201) {
        start();
        navigate("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
    }
    setLoading(false);
  }, [navigate]);

  const handelFiles = useCallback((event: FileList) => {
    const selectedMedia = Array.from(event || []);
    setValue("files", selectedMedia);
    const data: { type: string, src: string }[] = [];
    let filesProcessed = 0;

    selectedMedia.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          data.push({
            type: file.type,
            src: e.target?.result as string
          });
        }
        filesProcessed++;
        if (filesProcessed === selectedMedia.length) {
          setMedia(data);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [setValue])

  useEffect(() => {
    complete();
  }, [complete]);

  return (
    <Box sx={{display: 'flex', placeContent: 'center'}}>
      <Helmet>
        <title>Create New Post</title>
        <meta name="description" content="Create a New Post and get some reactions and reviews" />
      </Helmet>
      <form onSubmit={handleSubmit(formSubmit)} encType="multipart/form-data">
        <FilePicker
          onChangeMethod={(e) => e.target.files && handelFiles(e.target.files)}
        />
        <Box sx={{display: 'flex', placeItems: 'center', flexDirection: 'column', gap: '1rem'}}>
          <MediaComponent media={media} />
        </Box>
        <FloatingLabelInput
          label="Description"
          inputProps={{ multiline: true, ...register("desc") }}
        />
        <FloatingLabelInput label="Visibility" variant="filled" inputProps={{defaultValue: Visibility.public, select: true , ...register("visibility")}}>
          <MenuItem value={Visibility.public}>Public</MenuItem>
          <MenuItem value={Visibility.private}>Private</MenuItem>
          <MenuItem value={Visibility.friends_only}>Friends only</MenuItem>
        </FloatingLabelInput>
        <Button variant="contained" type="submit" loading={loading} loadingPosition="start">
          Post
        </Button>
      </form>
    </Box>
  );
}
