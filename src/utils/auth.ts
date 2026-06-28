import type { LoginResponse, ApiUserDetails } from '@/types/api.types';

export const extractAccessToken = (response: LoginResponse): string => {
  return (
    response.access_token ??
    response.accessToken ??
    response.token ??
    response.data?.access_token ??
    response.data?.token ??
    ''
  );
};

export const extractUserDetails = (response: LoginResponse): ApiUserDetails | undefined => {
  return response.userDetails ?? response.user ?? response.data?.userDetails ?? response.data?.user;
};

export const mapLoginUser = (
  userDetails: ApiUserDetails | undefined,
  fallbackUsername: string,
) => ({
  id: String(userDetails?.UserId ?? ''),
  name: userDetails?.DisplayName ?? userDetails?.UserName ?? fallbackUsername,
  email: '',
  role: userDetails?.RoleName ?? 'user',
  UserId: userDetails?.UserId,
  UserName: userDetails?.UserName,
  RoleId: userDetails?.RoleId,
  RoleName: userDetails?.RoleName,
  DisplayName: userDetails?.DisplayName,
  CompanyName: userDetails?.CompanyName,
});
