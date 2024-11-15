import Icon from '@mui/material/Icon';
import CommuteIcon from '@mui/icons-material/Commute';
import { lusitana, montserrat, roboto } from '@/app/ui/fonts';

export default function Logo() {
  return (
    <div
      className={`${montserrat.className} flex flex-row items-center leading-none text-blue-600`}
    >
      <CommuteIcon className="h-8 w-8 rotate-[15deg] fill-green-800" />
      <p className="text-[24px] font-medium">BMC Corp.</p>
    </div>
  );
}
