import { IPDFFile } from "./IPDFFile";
import { IUser } from "./IUser";

export interface IImageFile {
    ID?: number;
    Filename: string;
    FilePath: string;
    Status: string;
    Size: number;
    UpdatedDate: Date;
    UserID?: number;
    User?: IUser;
    PDFID?: number;
    PDF?: IPDFFile;
}