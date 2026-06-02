"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type AuthView = "login" | "register";

interface AuthModalContextProps {
  isOpen: boolean;
  view: AuthView;
  openModal: (view?: AuthView) => void;
  closeModal: () => void;
  setView: (view: AuthView) => void;
}

const AuthModalContext = createContext<AuthModalContextProps | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthView>("login");

  const openModal = (initialView: AuthView = "login") => {
    setView(initialView);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, view, openModal, closeModal, setView }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
