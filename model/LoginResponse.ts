export interface LoginResponse {
    username: string;
    name: string;
    roles: string;
    groupName?: string | null;
    jsessionID?: string | null;
    token: string;
}

export const sanitizeLoginResponse = (data: any): LoginResponse => ({
    username: data?.username ?? "",
    name: data?.name ?? "",
    roles: data?.roles ?? "",
    groupName: data?.groupName ?? null,
    jsessionID: data?.jsessionID ?? data?.JSessionID ?? null,
    token: data?.token ?? "",
});
