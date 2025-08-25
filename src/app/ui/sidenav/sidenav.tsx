import { useState } from "react";
import Link from "next/link";
import SideNavLinks from "@/app/ui/sidenav/sidenav-links";
import Logo from "@/app/ui/logo";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { signOutAction } from "@/app/lib/actions";
import { useSession } from "next-auth/react";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import OptionsMenu from "./OptionsMenu";

export default function SideNav() {
  const { data: session } = useSession();
  const user = session?.user;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // console.log(`id_token:`, session?.token.idToken);
  const toggleSidenav = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleSignOut = async () => {
    await signOutAction();
    // Add any additional sign-out logic here
  };
  return (
    <div
      className={`flex ${
        isCollapsed ? "w-16" : "w-64"
      } flex-col px-3 py-4 transition-all duration-300 relative`}
    >
      {/* <Link
        className={`hidden sm:block mb-2 h-30 items-end justify-start rounded-md bg-white p-4 ${
          isCollapsed ? "justify-center" : ""
        }`}
        href="/"
      >
        <div className={`text-blue-600 w-full flex justify-center`}>
          {!isCollapsed && <Logo />}
        </div>
      </Link> */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <SideNavLinks isCollapsed={isCollapsed} />

        <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
          <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

          <Stack
            direction="row"
            sx={{
              gap: 1,
              alignItems: "center",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <OptionsMenu />
            <Box sx={{ mr: "auto", display: { xs: "none", sm: "block" }}}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, lineHeight: "16px" }}
              >
              {user?.name || user?.userId || ""}
              </Typography>
              <Typography variant="caption" sx={{ color: "grey" }}>
                {user?.email}
              </Typography>
            </Box>
          </Stack>
        </div>
      </div>
    </div>
  );
}
