import { lusitana, montserrat, roboto } from '@/app/ui/fonts';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { useState } from 'react';

export default function Logo() {
  const { data: session, status } = useSession();
  const orgId = session?.user?.secondaryOrgId? session?.user?.secondaryOrgId : session?.user?.primaryOrgId;

  const [imageSrc, setImageSrc] = useState(`/images/${orgId}.pnga`);

  const handleError = () => {
    setImageSrc(`/images/logo-blue.png`);
  };

  // console.log(`printing orgid in logo`, session?.user);
  return (
    // <div
    //   className={`${montserrat.className} flex flex-row items-center leading-none text-blue-600`}
    // >
    <div className="flex flex-col items-center">
      <Image
        alt="CompanyLogo"
        src={imageSrc}
        sizes="100vw"
        width={100}
        height={100}
        className="object-contain"
        onError={handleError}
      />
    </div>
    // </div>
  );
}
