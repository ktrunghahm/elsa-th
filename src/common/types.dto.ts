import { UserInfo } from '../authen/authen.types';

export interface RequestSession {
  user: UserInfo;
}

export class SimpleSuccessResponse {
  public success: boolean;
  constructor(success = true) {
    this.success = success;
  }
}

export class SimpleCountResponse {
  public count: number;
  constructor(count: number) {
    this.count = count;
  }
}

export class AuthenSuccessResponse {
  public success = true;
  public userInfo?: UserInfo;
  constructor(userInfo?: UserInfo) {
    this.userInfo = userInfo;
  }
}

export class AuthenFailureResponse {
  public success = false;
}
