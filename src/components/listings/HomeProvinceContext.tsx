"use client";

import { createContext, useContext, useState } from "react";

interface HomeProvinceContextValue {
  province: string;
  setProvince: (p: string) => void;
}

const HomeProvinceContext = createContext<HomeProvinceContextValue>({
  province: "",
  setProvince: () => {},
});

export function HomeProvinceProvider({ children }: { children: React.ReactNode }) {
  const [province, setProvince] = useState("");
  return (
    <HomeProvinceContext.Provider value={{ province, setProvince }}>
      {children}
    </HomeProvinceContext.Provider>
  );
}

export function useHomeProvince() {
  return useContext(HomeProvinceContext);
}
