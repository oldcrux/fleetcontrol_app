"use client";

import { useSession } from "next-auth/react";
import jwt from "jsonwebtoken";
import { useEffect } from "react";
import { signOutAction } from "./lib/actions";

const checkTokenForExpiryAndLogout = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const tokenCheck = async () => {
      if (status === "authenticated" && session?.token.idToken) {
        try {
          const decodedToken = jwt.decode(session?.token.idToken);
          if (decodedToken && typeof decodedToken !== "string") {
            if (!decodedToken || !decodedToken.exp) {
              console.error("Invalid token: Missing exp field");
              await signOutAction();
              return;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken.exp < currentTime) {
              console.log("Token expired, signing out");
              await signOutAction();
            }
          }
        } catch (error) {
          console.error("Error checking token validity:", error);
          await signOutAction();
        }
      }
    };
    tokenCheck();
    console.log("Checking Token");
    const interval = setInterval(tokenCheck, 60000);

    return () => clearInterval(interval);
  }, [session, status]);
};

export default checkTokenForExpiryAndLogout;
