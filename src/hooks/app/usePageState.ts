import { useState } from "react";

export function usePageState() {
  const [currentPage, setCurrentPage] = useState("cbt");
  return { currentPage, setCurrentPage };
}
