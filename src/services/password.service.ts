import api from '@/lib/api';

type ChangePasswordPayload = {
  email: string;
  nuevaPassword: string;
};

export const passwordService = {
  changePassword: (data: ChangePasswordPayload) =>
    api.put("/password/email", data),
};