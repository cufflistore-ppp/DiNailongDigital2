/**
 * Developer / owner Nailong Digital
 * Email Google ini = akses panel admin & mode developer
 */
window.NAILONG_DEV = {
  email: 'raffliraffli649@gmail.com',
  role: 'developer'
};
window.NAILONG_IS_DEV = function (email) {
  return String(email || '').trim().toLowerCase() === window.NAILONG_DEV.email.toLowerCase();
};
