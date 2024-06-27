import { IUser } from "./IUser";

export interface ISession {
    ID?: number;
    LoginTime: Date;
    LogoutTime?: Date;
    SessionToken: string;
    UserID?: number;
    User?: IUser;
}