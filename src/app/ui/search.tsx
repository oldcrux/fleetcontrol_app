"use client";

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Box, TextField } from '@mui/material';
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    // console.log(`Searching... ${term}`);
    const params = new URLSearchParams(searchParams);
    // params.set('page', '1');
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-black"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <SearchOutlinedIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
    // <Box
    //   sx={{
    //     display: 'flex',
    //     justifyContent: 'flex-end',
    //     alignItems: 'center',
    //     position: 'absolute',
    //     top: '16px',
    //     right: '16px',
    //     width: '100%',
    //     padding: '0 16px',
    //   }}
    // >
    //   <TextField
    //     variant="outlined"
    //     placeholder="Search Vehicles..."
    //     size="small"
    //     sx={{ maxWidth: '300px' }}
    //     onChange={(e) => {
    //             handleSearch(e.target.value);
    //           }}
    //   />
    // </Box>
  );
}
