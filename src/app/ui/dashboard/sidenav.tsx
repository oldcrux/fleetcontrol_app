import { useState } from "react";
import Link from "next/link";
import SideNavLinks from "@/app/ui/dashboard/sidenav-links";
import Logo from "@/app/ui/logo";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import { signOutAction } from "@/app/lib/actions";

export default function SideNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidenav = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div
      className={`flex ${
        isCollapsed ? "w-16" : "w-64"
      } h-full flex-col px-3 py-4 transition-all duration-300 relative`}
    >
      <Link
        className={`mb-2 flex h-20 items-end justify-start rounded-md bg-blue-200 p-4 ${
          isCollapsed ? "justify-center" : ""
        }`}
        href="/"
      >
        <div className={`text-blue-600 w-full flex justify-center`}>
          {!isCollapsed && <Logo />}
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <SideNavLinks isCollapsed={isCollapsed} />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form
          action={async (formData) => {
            await signOutAction();
          }}
        >
          <button
            type="submit"
            className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-blue-200 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <PowerSettingsNewOutlinedIcon className="w-6 text-blue-600" />
            <div className={`hidden md:block text-blue-600`}>
              {!isCollapsed && `Sign Out`}
            </div>
          </button>
        </form>
      </div>
      {/* Collapsible Button */}
      {/* <button
        onClick={toggleSidenav}
        className={`absolute bottom-1 transform -translate-y-1/2 transition-all duration-300 ${
          isCollapsed ? "left-16" : "left-52"
        } rounded-full shadow-md flex items-center justify-center hover:bg-blue-200 hover:text-blue-600`}
      >
        {isCollapsed ? ">" : "<"}
      </button>
      <div
        className={`absolute top-0 right-0 h-full bg-gray-300 transition-all duration-300 ${
          isCollapsed ? "left-16" : "left-54"
        } hidden md:block`}
        style={{ width: isCollapsed ? "1px" : "2px" }}
      ></div> */}
    </div>
  );
}
