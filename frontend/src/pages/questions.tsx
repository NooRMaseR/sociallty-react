import {
  Box,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useLoadingBar } from "react-top-loading-bar";
import { useEffect } from "react";

export default function QuestionsPage() {
  const { complete } = useLoadingBar();
  useEffect(() => complete());

  return (
    <Box>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography component="span">Who Are We?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Actully it's only me, this website it's just a test to see if it can
            work for my career, i'm NooR MaseR from Egypt and i'm the developer
            of this website you can contact mee through wnenoor@gmail.com if you
            have any questions
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography component="span">How can i Edit My Profile?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            You Can go to your profile and click on Edit Button then fill your
            needed information along with your password to confirm.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography component="span">Can I Delete My Account?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Yes, You Can Delete Your Account, just Head to the settings and you
            will find Delete Account Button.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel4-content"
          id="panel4-header"
        >
          <Typography component="span">
            Does My Info still exists after Deleting My Account?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            No, Your Data Will be Deleted permanently along with your posts and
            every thing related to you.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel5-content"
          id="panel5-header"
        >
          <Typography component="span">Who Can See My Posts?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            if your Post is public then everyone will see your post, if your
            Post is friends only then all your friends will see your post, if
            your Post is Private then only you will see your post
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
