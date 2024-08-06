import { IAudioFile } from "./IAudioFile";
import { IConversion } from "./IConversion";
import { IImageFile } from "./IImageFile";
import { IUser } from "./IUser";

export interface IPDFFile {
    ID?: number;
    Filename: string;
    FilePath: string;
    UploadDate: Date;
    Size: number;
    Status: string;
    Source: string;
    Text: string;
    AudioFiles?: IAudioFile[];
    Conversions?: IConversion[];
    Images?: IImageFile[];
    UserID?: number;
    User?: IUser;
}
