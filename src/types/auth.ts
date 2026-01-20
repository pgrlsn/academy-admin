export interface User {
  id: number;
  name: string;
  contactNumber: string;
  role: string;
  organizationId: number;
  organizationName?: string;
  token?: string;
}

export interface LoginRequest {
  number: string;
  otp?: string;
  referenceId?: string;
  loginFrom: string;
}

export interface LoginResponse {
  status: {
    code: number;
    message?: string;
  };
  response: {
    valid: boolean;
    token?: string;
    userBO?: User;
    staffType?: string;
    exception?: string;
  };
}

export interface OtpResponse {
  status: {
    code: number;
    message?: string;
  };
  response: {
    referenceId: string;
    message?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
