import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

import Link from 'next/link';
// import { deleteVehicle } from '@/app/lib/actions';

export function CreateVehicle() {
  return (
    <Link
      href="/dashboard/vehicles/create"
      className="btn-primary"
    >
      <span className="hidden md:block">Create Vehicle</span>{' '}
      <AddOutlinedIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function BulkCreateVehicles() {
  return (
    <Link
      href="/dashboard/vehicles/create"
      className="btn-primary"
    >
      <span className="hidden md:block">Bulk Create Vehicle</span>{' '}
      <PlaylistAddIcon className="h-5 md:ml-4" />
    </Link>
  );
}


export function UpdateVehicle({ id }: { id: string }) {
  return (
    <Link
    href={`/dashboard/vehicles/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <CreateOutlinedIcon className="w-5" />
    </Link>
  );
}

export function DeleteVehicle({ id }: { id: string }) {
  // const deleteVehicleWithId = deleteVehicle.bind(null, id);
  return (
    <></>
    // <form action={deleteVehicleWithId}>
    //   <button className="rounded-md border p-2 hover:bg-gray-100">
    //     <span className="sr-only">Delete</span>
    //     <TrashIcon className="w-5" />
    //   </button>
    // </form>
  );
}
