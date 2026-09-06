"use client";

import dynamic from "next/dynamic";
import { TerrenosMapProps } from "./terrenos-map";
import { MapSkeleton } from "./map-skeleton";

export const TerrenosMapDynamic = dynamic<TerrenosMapProps>(
  () => import("./terrenos-map").then((mod) => mod.TerrenosMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);
