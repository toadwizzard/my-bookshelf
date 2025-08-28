import { Injectable } from '@angular/core';
import { UserInfo } from './user-info';

interface UserInfoWithId extends UserInfo {
  id: number,
}

const users: UserInfoWithId[] = [
  {
    id: 1,
    username: "User1",
    email: "q@q.com",
  },
  {
    id: 2,
    username: "User2",
    email: "w@w.com",
  }
]

@Injectable({
  providedIn: 'root'
})
export class UserService {
  getUser(userId: number): UserInfo | undefined {
    return users.find(user => user.id === userId);
  }
}
