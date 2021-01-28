import { ISignatureRow } from './ISignatureRow';

export interface ISignatureFormData {
  folderName: string;
  enforceSigningSequence: boolean;
  signatureRows: ISignatureRow[];
  senderEmail: string;
  accessToken: string;
}
