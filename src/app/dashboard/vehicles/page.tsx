import VehicleTable from "@/app/ui/vehicle/vehicle-table";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  // const query = searchParams?.query || "";
  // const currentPage = Number(searchParams?.page) || 1;
  // const totalPages = await allVehicleSearch(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-2">
        <h1 className="text-2xl text-white">Vehicles</h1>
      </div>
      {/* <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search Vehicles" />
        <CreateVehicle />
        <BulkCreateVehicles />
      </div> */}
      {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
        <VehicleTable />
      {/* </Suspense> */}
      {/* <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div> */}
    </div>
  );
}
