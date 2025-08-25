"use client";
import { montserrat } from "@/app/ui/fonts";
// import { Button } from "@/app/ui/button";
import { useEffect, useState } from "react";
import { authenticate } from "../lib/actions";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Divider from "@mui/material/Divider";
import { Box, Typography, Button, TextField } from "@mui/material";
import { grey } from "@mui/material/colors";

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  // const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(""); // Reset error message

    const formData = new FormData(event.target);
    const userId = formData.get("userId");
    const password = formData.get("password");

    try {
      if (typeof userId === "string" && typeof password === "string") {
        await authenticate({ userId, password });
      } else {
        console.error("Invalid form data");
      }

      // Poll for session status
      const intervalId = setInterval(async () => {
        const session = await getSession();
        if (session) {
          clearInterval(intervalId);
          // setIsPending(false);
          router.push("/dashboard");
          // setRedirectToDashboard(true);
        } else {
          setErrorMessage("Still unauthenticated, retrying...");
        }
      }, 500); // Check every 1/2 second
    } catch (error) {
      setErrorMessage(`Invalid Credential`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
    <div
          className={`${montserrat.className} fixed top-2 left-2 p-1 text-xs text-gray-300 flex justify-center sm:justify-end`}
        >
          <a href="https://abc.com/" className="hover:text-blue-500">
          {'<'} abc.com
          </a>
        </div>
        
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            borderRadius: "8px",
            backgroundColor: "#bfdbfe",
            padding: "24px",
            width: "100%",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography
              variant="h5"
              color="primary"
              fontWeight="normal"
              sx={{ fontFamily: `${montserrat.style.fontFamily} !important` }}
            >
              abc
            </Typography>
            <Typography variant="h4" color="primary">
              Fleet Dashboard
            </Typography>
          </Box>

          <Typography variant="h5" color="textPrimary" gutterBottom>
            Sign In
          </Typography>

          <TextField
            label="Username"
            id="userId"
            name="userId"
            type="text"
            fullWidth
            required
            sx={{
              mb: 2,
              backgroundColor: "#f5f5f5",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputLabel-root": {
                color: "#555",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#bbb",
              },
            }}
            placeholder="Enter your userId"
          />

          <TextField
            label="Password"
            id="password"
            name="password"
            type="password"
            fullWidth
            required
            sx={{
              mb: 2,
              backgroundColor: "#f5f5f5",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputLabel-root": {
                color: "#555",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#bbb",
              },
            }}
            placeholder="Enter password"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 2 }}
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Log in"}
          </Button>

          <Divider
            sx={{
              width: "100%",
              my: 2,
              borderColor: "gray",
              borderBottomWidth: 2,
            }}
          >
            <Typography variant="body2" color="textSecondary" sx={{ px: 2 }}>
              Or
            </Typography>
          </Divider>

          <Button
            onClick={() => signIn("google")}
            sx={{
              padding: 0,
              width: "auto",
              height: "auto",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <img
              src="/images/google_signin.svg"
              alt="Google Sign In"
              style={{
                width: 150,
                height: 50,
                objectFit: "contain",
              }}
            />
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 1,
            }}
          >
            {errorMessage && (
              <Typography variant="body2" color="error">
                {errorMessage}
              </Typography>
            )}
          </Box>
        </Box>
      </form>
    </>
  );
}
