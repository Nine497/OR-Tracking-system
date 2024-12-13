import { useContext } from "react";
import { AuthContext } from "../components/Context";

export function useAuth() {
  return useContext(AuthContext);
}