import { useContext, Context } from "react";

export default function useSafeContext<T>(Context: Context<T | undefined>): T {
  const ctx = useContext(Context);
  if (!ctx) throw new Error(`${Context.name} must be used within Provider`);
  return ctx;
}
