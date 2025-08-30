import { inject, Injectable } from '@angular/core';
import { UserInfo } from './user-info';
import { AuthService } from './auth-service';
import { Router } from '@angular/router';

interface UserInfoWithId extends UserInfo {
  id: number,
}

const users: UserInfoWithId[] = [
  {
    id: 1,
    username: "admin",
    email: "q@q.com",
    password: "admin",
  },
  {
    id: 2,
    username: "user",
    email: "w@w.com",
    password: "pw",
  }
]

@Injectable({
  providedIn: 'root'
})
export class UserService {
  authService = inject(AuthService);
  router = inject(Router);

  getUser(): UserInfo | undefined {
    const userId = this.handleAuthentication();
    return userId !== undefined ? users.find(user => user.id === userId) : undefined;
  }

  checkUsernameUnique(username: string): boolean {
    const userId = this.authService.getId();
    const userWithUserName = users.find(user => user.username === username);
    return !userWithUserName || userWithUserName.id === userId;
  }

  register(user: UserInfo): number {
    const newUser: UserInfoWithId = {
      id: this.getLargesUserId() + 1,
      username: user.username,
      email: user.email,
      password: user.password,
    };
    users.push(newUser);
    return newUser.id;
  }

  login(credentials: {username: string, password: string}): number | undefined {
    return users.find(user => user.username === credentials.username && user.password === credentials.password)?.id;
  }

  private getLargesUserId(): number {
    return users.reduce((acc, cur) => acc.id < cur.id ? cur : acc).id;
  }

  checkPasswordMatches(password: string): boolean {
    const user = this.getUser();
    if(user === undefined) return false;
    return user.password === password;
  }

  updateUser(user: UserInfo): UserInfo | undefined {
    const userId = this.handleAuthentication();
    if(userId === undefined)
      return undefined;
    const userIndex = users.findIndex(user => user.id === userId);
    if(userIndex < 0)
      return undefined;
    users[userIndex].username = user.username;
    users[userIndex].email = user.email;
    if(user.password !== "")
      users[userIndex].password = user.password;
    return users[userIndex];
  }

  //stand-in for proper 401 http response
  handleAuthentication(): number | undefined {
    const userId = this.authService.getId();
    const idValid = userId !== undefined && users.some(user => user.id === userId);
    if(!idValid){
      this.authService.deleteId();
      this.router.navigate(["/login"]);
    }
    return userId;
  }
}
