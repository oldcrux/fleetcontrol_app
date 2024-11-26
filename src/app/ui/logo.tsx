import { lusitana, montserrat, roboto } from '@/app/ui/fonts';
import Image from 'next/image';
import { useSession } from "next-auth/react";

export default function Logo() {
  const { data: session, status } = useSession();
  const orgId = session?.user?.orgId;

  // console.log(`printing orgid in logo`, orgId);
  return (
    <div
      className={`${montserrat.className} flex flex-row items-center leading-none text-blue-600`}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Image
        alt="CompanyLogo"
        src={`/images/${orgId}.png`}
        sizes="100vw"
        width={300}
        height={300}
      />
    </div>
    </div>
  );
}
