import { createContext, useContext } from "react";

export interface ToastContextValue {
  notify: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  notify: () => undefined,
});

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
