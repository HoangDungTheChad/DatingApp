export function mapMember(apiMember: any) {
  return {
    ...apiMember,
    username: apiMember.userName,
  };
}
