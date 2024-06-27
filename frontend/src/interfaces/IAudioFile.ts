import { IConversion } from "./IConversion";
import { IPDFFile } from "./IPDFFile";
import { IUser } from "./IUser";

export interface IAudioFile {
    ID?: number;
    Filename: string;
    FilePath: string;
    ConversionDate: Date;
    Format: string;
    Duration: number;
    Size: number;
    Status: string;
    DownloadLink: string;
    PDFID?: number;
    PDF?: IPDFFile;
    UserID?: number;
    User?: IUser;
    Conversions?: IConversion[];
}