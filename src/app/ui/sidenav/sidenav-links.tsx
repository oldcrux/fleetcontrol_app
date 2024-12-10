'use client'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CommuteIcon from '@mui/icons-material/Commute';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useSession } from "next-auth/react";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeOutlinedIcon, roles:['system', 'admin', 'view'] },
  { name: 'Geofences', href: '/dashboard/geofences', icon: LocationOnIcon, roles:['system', 'admin'] },
  { name: 'Vehicles',href: '/dashboard/vehicles', icon: CommuteIcon, roles:['system', 'admin', 'view']},
  { name: 'Vehicle Telemetry Report', href: '/dashboard/reports', icon: AssessmentIcon, roles:['system', 'admin', 'view'] },
  { name: 'Vendors', href: '/dashboard/vendors', icon: PeopleOutlineOutlinedIcon, roles:['system', 'admin'] },
  // { name: 'Users', href: '/dashboard/users', icon: PeopleOutlineOutlinedIcon, roles:['system', 'admin'] },
];

interface SideNavLinksProps {
  isCollapsed: boolean;
}

const SideNavLinks: React.FC<SideNavLinksProps> = ({ isCollapsed }) =>  {
  const pathname = usePathname();

  const { data: session } = useSession();
  const userRole = session?.user?.role as string;

  return (
    <>
    {links
      .filter((link) => link.roles.includes(userRole))
      .map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] items-center justify-center gap-2 rounded-md bg-blue-500 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{!isCollapsed && link.name}</p>
          </Link>
        );
      })}
  </>
  );
}

export default SideNavLinks;