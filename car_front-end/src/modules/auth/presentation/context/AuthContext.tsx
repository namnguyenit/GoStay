import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  IAuthService,
  LoginDTO,
  RegisterDTO,
} from "../../application/port/auth.service.interface";
import type { UserEntity } from "../../domain/entity/user.entity";

// Import Single Instance từ Composition
import { authService as defaultAuthService } from "../../composition";
import { operatorService } from "@/modules/operator/composition";

interface AuthContextType {
  user: UserEntity | null;
  token: string | null;
  isOperator: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (dto: LoginDTO) => Promise<void>;
  register: (dto: RegisterDTO) => Promise<void>;
  logout: () => void;
  authService: IAuthService;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  service?: IAuthService;
}> = ({ children, service = defaultAuthService }) => {
  const [token, setToken] = useState<string | null>(service.getToken());
  const [user, setUser] = useState<UserEntity | null>(null);
  const [isOperatorStatus, setIsOperatorStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    const activeToken = service.getToken();
    if (!activeToken) {
      setUser(null);
      setIsOperatorStatus(false);
      setLoading(false);
      return;
    }

    try {
      const me = await service.getMe();
      setUser(me);

      if (me.isAdmin()) {
        setIsOperatorStatus(false);
      } else {
        try {
          const opStatus = await operatorService.getMyOperatorStatus();
          setIsOperatorStatus(opStatus.isOperator);
        } catch {
          setIsOperatorStatus(me.isOperator());
        }
      }
    } catch {
      service.logout();
      setToken(null);
      setUser(null);
      setIsOperatorStatus(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (dto: LoginDTO) => {
    const newToken = await service.login(dto);
    setToken(newToken);
    await fetchUser();
  };

  const register = async (dto: RegisterDTO) => {
    await service.register(dto);
  };

  const logout = () => {
    service.logout();
    setToken(null);
    setUser(null);
    setIsOperatorStatus(false);
  };

  const isAdmin = Boolean(user && user.isAdmin());
  const isOperator = Boolean(
    !isAdmin && user && (user.isOperator() || isOperatorStatus)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isOperator,
        isAdmin,
        loading,
        login,
        register,
        logout,
        authService: service,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
