
import LoginForm from '@/app/ui/login-form';
import React from 'react';
import Logo from '../ui/logo';
import { Box, Container } from '@mui/material';
import Banner from '../ui/info-banner';
 
export default function LoginPage() {
  
  return (
    // <main className="flex items-center justify-center md:h-screen">
    //   <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
    //     <LoginForm />
    //   </div>
    // </main>

    <Box
      component="main"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: { xs: "100vh", md: "100vh" }, // Full height for responsiveness
        p: 2, // Padding for smaller screens
      }}
    >
      <Box>
              <Banner
              />
          </Box>
      <Container
        maxWidth="xs"
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 2, // Space between elements
          p: 4, // Padding around the form
          boxShadow: 3, // Optional shadow for styling
          borderRadius: 2, // Rounded corners
          // bgcolor: "background.paper", // Background color
        }}
      >
        <LoginForm />
      </Container>
    </Box>
  );
}