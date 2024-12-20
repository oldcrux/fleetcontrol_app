"use client";
import React from "react";
import SideNav from "@/app/ui/sidenav/sidenav";
import { useSession } from "next-auth/react";
import { Box, Button, Typography } from "@mui/material";
import { signOutAction } from "@/app/lib/actions";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const role = session?.user.role;
  const orgId = session?.user.primaryOrgId;

  const handleSignOut = async () => {
    await signOutAction();
  };

  return (
    // <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-blend-lighten">
    //   <SideNav />
    //   <div className="flex-grow p-2 md:overflow-y-auto md:p-2 mr-2">
    //     {children}
    //   </div>
    <>
      {role && orgId ? (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-blend-lighten">
          <SideNav />
          <div className="flex-grow p-2 md:overflow-y-auto md:p-2 mr-2">
            {children}
          </div>
        </div>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h6" color="error" align="center" sx={{ mb: 2 }}>
            Unauthorized access
          </Typography>
          <Button variant="contained" color="primary" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Box>
      )}
    </>
  );
}
