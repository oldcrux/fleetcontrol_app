import Users from "@/app/ui/user/user-table";

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
        <h1 className="text-2xl text-white">Users</h1>
      </div>
        <Users />
    </div>
  );
}
