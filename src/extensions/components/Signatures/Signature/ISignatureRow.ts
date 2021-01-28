import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';

export interface ISignatureRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  //inPersonSigningAdmin: string;
  permission: string;
  dialingCode: string;
  mobileNumber: string;
  boxStyle: {};
  peopleListData: IPersonaProps;
  index: number;
  signingSequenceNumber: number;
}
