'use client'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CommuteIcon from '@mui/icons-material/Commute';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeOutlinedIcon },
  { name: 'Geofences', href: '/dashboard/geofences', icon: LocationOnIcon },
  { name: 'Vehicles',href: '/dashboard/vehicles', icon: CommuteIcon,},
  { name: 'Vehicle Telemetry Report', href: '/dashboard/reports', icon: AssessmentIcon },
  // { name: 'Users', href: '/dashboard/users', icon: PeopleOutlineOutlinedIcon },
];

interface SideNavLinksProps {
  isCollapsed: boolean;
}

const SideNavLinks: React.FC<SideNavLinksProps> = ({ isCollapsed }) =>  {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
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
            <p className="hidden md:block">{ !isCollapsed && link.name}</p>
          </Link>
        );
      })}
    </>
  );
}

export default SideNavLinks;