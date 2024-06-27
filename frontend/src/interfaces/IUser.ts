import { IPDFFile } from './IPDFFile';
import { IAudioFile } from './IAudioFile';
import { IConversion } from './IConversion';
import { ISession } from './ISession';
import { IImageFile } from './IImageFile';

export interface IUser {
    ID?: number;
    Username: string;
    Password: string;
    Email: string;
    Birthday: Date;
    CreatedAt: Date;
    UpdatedAt: Date;
    PDFFiles?: IPDFFile[];
    AudioFiles?: IAudioFile[];
    Conversions?: IConversion[];
    Sessions?: ISession[];
    ImageFiles?: IImageFile[];
}