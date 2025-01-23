import FloatingLabelInput from "../components/floating_input_label";
import { Button, MenuItem, TextField } from "@mui/material";
import { PostFormProps } from "../utils/constants";
import FilePicker from "../components/file_picker";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../utils/api";

export default function MakePostPage() {
  document.title = "Share a Post";

  const { register, handleSubmit, setValue } = useForm<PostFormProps>();
  const navigate = useNavigate();

  const formSubmit = async (data: PostFormProps) => {
    const form_data = new FormData();
    form_data.append("desc", data.desc);
    form_data.append("visibility", data.visibility);
    data?.files?.forEach((file) => form_data.append("files", file));

    try {
      const res = await api.post("/api/post/", form_data);

      if (res.status === 201) {
        navigate("/");
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div id="container">
      <form
        onSubmit={handleSubmit(formSubmit)}
        encType="multipart/form-data"
        id="post-form"
      >
        <FilePicker
          onChangeMethod={(e) =>
            setValue("files", Array.from(e.target.files || []))
          }
        />
        <FloatingLabelInput
          label="Description"
          inputProps={{ multiline: true, ...register("desc") }}
        />
        <TextField
          label="Visibility"
          className="mb-3"
          defaultValue={"public"}
          variant="filled"
          select
          slotProps={{ input: { ...register("visibility") } }}
          sx={{
            "& .MuiFormLabel-root": {
              color: "#ababab",
            },
            "& .MuiFilledInput-root": {
              color: "#fff",
            },
          }}
        >
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="private">Private</MenuItem>
          <MenuItem value="friends only">Friends only</MenuItem>
        </TextField>
        <Button variant="contained" color="primary" type="submit">
          Post
        </Button>
      </form>
    </div>
  );
}
