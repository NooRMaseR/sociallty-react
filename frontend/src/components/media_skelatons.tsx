import { Avatar, Skeleton } from "@mui/material";
import { useState } from "react";

interface MediaProps {
  src?: string;
  alt?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  onClick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function Image({ src, alt, className, width, height, onClick, ...props}: MediaProps) {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  return (
    <>
      {!imageLoaded ? (
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{ width: width ?? "80%", height: height ?? "35rem", mb: "2rem" }}
        />
      ) : null}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        hidden={!imageLoaded}
        onLoad={() => setImageLoaded(true)}
        className={className}
        onClick={onClick}
        {...props}
      />
    </>
  );
}

export function LazyAvatar({ src, alt, width = "3.5rem", height = "3.5rem", ...props}: MediaProps) {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  return (
    <>
      {!imageLoaded ? (
        <Skeleton
          variant="circular"
          animation="wave"
          sx={{ width: width, height: height }}
        />
      ) : null}
      
      <Avatar
        src={src}
        alt={alt}
        hidden={!imageLoaded}
        sx={{ width: width, height: height }}
        onLoad={() => setImageLoaded(true)}
        {...props}
      />
    </>
  )
}