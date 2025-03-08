import { Box, Typography } from "@mui/material";

export default function Page404() {
    return (
        <Box className="d-flex justify-content-center align-items-center" sx={{ height: "100svh", flexDirection: "column" }}>
            <Typography variant="h2" sx={{color: '#fff'}}>Page Not Found</Typography>
            <Typography variant="h3" sx={{color: '#fff'}}>404</Typography>
        </Box>
    );
}