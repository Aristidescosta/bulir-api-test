import * as refresh_token from './RefreshToken';
import * as logout from './Logout';
import * as login from './Login';
import * as me from './Me';

export const AuthController = {
  ...login,
  ...logout,
  ...me,
  ...refresh_token,
};