const getAdminFromMember = (member, admins) => {
  if (!!member && !!admins) {
    return admins.find((admin) => admin.code === member.code_admin);
  }
};

export default getAdminFromMember;
