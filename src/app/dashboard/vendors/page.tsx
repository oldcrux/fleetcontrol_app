import VehicleTable from "@/app/ui/vehicles/vehicle-table";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-2">
        <h1 className="text-2xl text-white">Vehicles</h1>
      </div>
        <VehicleTable />
    </div>
  );
}
