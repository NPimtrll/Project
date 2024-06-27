import { IAudioFile } from "./IAudioFile";
import { IPDFFile } from "./IPDFFile";
import { IUser } from "./IUser";

export interface IConversion {
    ID?: number;
    ConversionDate: Date;
    Status: string;
    ErrorMessage?: string;
    UserID?: number;
    User?: IUser;
    PDFID?: number;
    PDF?: IPDFFile;
    AudioID?: number;
    Audio?: IAudioFile;
}