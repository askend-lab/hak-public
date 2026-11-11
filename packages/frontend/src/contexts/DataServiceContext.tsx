// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createContext, useContext, useMemo, ReactNode } from "react";
import { DataService } from "@/services/dataService";

export const DataServiceContext = createContext<DataService | undefined>(
  undefined,
);

export function DataServiceProvider({ children }: { children: ReactNode }) {
  const dataService = useMemo(() => new DataService(), []);

  return (
    <DataServiceContext.Provider value={dataService}>
      {children}
    </DataServiceContext.Provider>
  );
}

export function useDataService(): DataService {
  const context = useContext(DataServiceContext);
  if (!context) {
    throw new Error("useDataService must be used within DataServiceProvider");
  }
  return context;
}
