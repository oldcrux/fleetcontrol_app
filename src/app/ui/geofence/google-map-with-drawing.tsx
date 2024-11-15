// "use client"
import React from 'react';
import {createRoot} from 'react-dom/client';
import {APIProvider} from '@vis.gl/react-google-maps';

import Drawing from './drawing';

// const API_KEY =
//   globalThis.GOOGLE_MAPS_API_KEY ?? (process.env.GOOGLE_MAPS_API_KEY as string);

const GoogleMapWithDrawing = () => {
  return (
      <Drawing />
  );
};

export default GoogleMapWithDrawing;
