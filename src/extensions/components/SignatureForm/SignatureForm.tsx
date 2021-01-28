import * as React from "react";
import 'office-ui-fabric-react/dist/css/fabric.css';
import { TextField, Checkbox } from "office-ui-fabric-react";
import DocumentList from './DocumentList/DocumentList';
import IspFileInfo from '../../eSignCommandSet/IspFileInfo';
import { HttpClient } from "@microsoft/sp-http";
import Signatures from '../../components/Signatures/Signatures';
import { ISignatureRow } from '../Signatures/Signature/ISignatureRow';
import { ISignatureFormData } from '../Signatures/Signature/ISignatureFormData';
import './SignatureForm.module.scss';

export interface ISignatureFormProps {
  selectedDocs: IspFileInfo[];
  contextHttpClient: HttpClient;
  webAbsoluteURL: string;
  //syncData: (formDataCol: ISignatureRow[]) => void;
  syncData: (formDataCol: ISignatureFormData) => void;
  onSend: () => void;
  onSignAndSend: () => void;
  onPreviewAndSend: () => void;
  onClose: () => void;
}

export interface ISignatureFormState{
  enforceSigningSequence: boolean;
  folderName: string;
}

class SignatureForm extends React.Component<ISignatureFormProps, ISignatureFormState> {

  private styleButtonSend = {
    width: "45px",
    height: "20px",
    border: "1px solid #00C2FF",
    "box-sizing": "border-box",
    borderRadius: "3px",
    "margin-right": "5px"
 };
  private styleButtonSignAndSend = {
    width: "150px",
    height: "20px",
    border: "1px solid #00C2FF",
    "box-sizing": "border-box",
    borderRadius: "3px",
    "margin-right": "5px"
};
  private styleButtonPreviewAndSend = {
    width: "200px",
    height: "20px",
    border: "1px solid #00C2FF",
    "box-sizing": "border-box",
    borderRadius: "3px",
    "margin-right": "5px"
};
  private styleButtonCancel = {
    width: "50px",
    height: "20px",
    border: "1px solid #00C2FF",
    "box-sizing": "border-box",
    borderRadius: "3px",
    "margin-right": "5px"

};
  private styleButtonSpan = {
    "font-family": "Roboto",
    "font-style": "normal",
    "font-weight": "normal",
    "font-size": "16px",
    "line-height": "14px",
    color: "#00C2FF"
 };

 private styleButton = {
    marginRight: "1rem"
 };
  private styleFolderNameText = {
  "font-family": "Roboto",
  "font-style": "normal",
  "font-weight": "500",
  "font-size": "14px",
  "line-height": "16px",
  color: "#000000"
 };
  private styleTextBox = {
  background: "#FFFFFF",
  border: "1px solid #C4C4C4",
  "box-sizing": "border-box",
  width: "100%"
 };
  private styleGridColButton = {
    display: "flex",
    "flex-direction": "row"
 };
  private styleGridDocBorder = {
  borderLeft: "2px solid #00C2FF",
  marginTop: "11px"
 };
  private styleGridDivider = {
  border: "1px solid #AAAAAA",
  height: "0px",
  margin: "11px 0px 11px 0px"
 };
  private styleGridPartiesDiv = {
  "font-family": "Roboto",
  "font-style": "normal",
  "font-weight": "bold",
  "font-size": "16px",
  "line-height": "19px",
   color: "#000000",
   paddingTop:"5px",
   paddingBottom:"5px"
 };




 private formDataCol: ISignatureFormData;
 private folderName: string;


  constructor(props){
    super(props);

    let arrFileNames = this.props.selectedDocs.map(file => {
        return file.fileName.substring(0, file.fileName.lastIndexOf('.'));
    });
    this.folderName = arrFileNames.reduce((total, crntVal) => {
      return total + ',' + crntVal;
    });

    if(this.folderName.length > 90){
      this.folderName = this.folderName.substring(0,90);
    }

    this.state = {
      enforceSigningSequence: false,
      folderName: this.folderName
    };
  }

  // Update form data and propagate to parent class
  private syncFormDataHandler(formDataRowCol: ISignatureRow[]) {


    this.formDataCol = {
      enforceSigningSequence: this.state.enforceSigningSequence,
      folderName: this.state.folderName,
      signatureRows: [...formDataRowCol ],
      senderEmail: '', // will be populated on button click.
      accessToken:'' // will be populated before final send
    };

    this.props.syncData(this.formDataCol);
  }

  public componentDidUpdate() {
   // this.props.syncData([ ...this.state.signatureRows ]);
   console.log("Signature Form componentDidUpdate");
  }

  public componentWillReceiveProps(nextProps) {
    console.log("Signature Form componentWillReceiveProps");
    console.log(nextProps);

  }

  public componentWillUpdate(nextProps, nextState) {
  }

  private _onChange = (ev: React.FormEvent<HTMLElement>, isChecked: boolean) => {
    //console.log(`The option has been changed to ${isChecked}.`);
    this.setState( { enforceSigningSequence: !this.state.enforceSigningSequence });

  }

  private changeHandler = (event, elementName) => {
    const newState = { ...this.state };
    newState[elementName] = event.target.value;
    this.setState(newState);
    // this.ishandlerEvent = true;
    // this.isSaveRequired = true;
  }


  public render(){

    return(
      <div className="ms-Grid" dir="ltr">
        <div className='ms-Grid-row'>
          <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ms-smPush6 ms-mdPush6 ms-lgPush6" style={{ display:"flex", justifyContent: "flex-end", height: "30px" }}>
              <button title="Send" style={ this.styleButton }><span style={ this.styleButtonSpan } onClick={ this.props.onSend } >Send</span></button>
              <button title="Sign and Send" style={ this.styleButton }><span style={ this.styleButtonSpan } onClick={ this.props.onSignAndSend } >Sign and Send</span></button>
              <button title="Preview and Send" style={ this.styleButton }><span style={ this.styleButtonSpan } onClick={ this.props.onPreviewAndSend } >Preview and Send</span></button>
              <button title="Cancel" style={ this.styleButton }><span style={ this.styleButtonSpan } onClick={ this.props.onClose } >Cancel</span></button>
          </div>
        </div>
        <div className='ms-Grid-row'>
        <div className='ms-Grid-col ms-sm6 ms-md6 ms-lg6 smPull6 mdPull6 lgPull6'>
              <TextField label='Folder Name' name="folderName" required value={ this.state.folderName } onChange={ (event) => this.changeHandler(event, 'folderName') } />
          </div>
        </div>
        <div className='ms-Grid-row'>
        <div className='ms-Grid-col ms-sm12 ms-md12 ms-lg12'>
                <h3>Signing Documents List</h3>
            </div>
        </div>
        <div className='ms-Grid-row'>
            <div className='ms-Grid-col ms-sm12 ms-md12 ms-lg12' style={ this.styleGridDocBorder }>
              <DocumentList selectedDocs={ this.props.selectedDocs } />
            </div>
        </div>
        <div className='ms-Grid-row'>
            <div className='ms-Grid-col ms-sm12 ms-md12 ms-lg12'>
              <h3>Add Signing Options</h3>
            </div>
        </div>
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm1 ms-md1 ms-lg1" style={{ width: "3%"}}></div>
            <div className="ms-Grid-col ms-sm1 ms-md1 ms-lg1" style={{ width: "3%"}}></div>
            <div className="ms-Grid-col ms-sm10 ms-md10 ms-lg10" style={{ paddingLeft:"10px", paddingTop:"5px",paddingBottom:"5px",margin:"5px" }}>
              <Checkbox  style={ {"fontWeight": "bold"} } label="Enforce Signing Sequence" onChange={this._onChange} />
            </div>
        </div>

        <div className='ms-Grid-row'>
            <div className='ms-Grid-col ms-sm12 ms-md12 ms-lg12' style={ this.styleGridDivider }>
            </div>
        </div>
        <div className='ms-Grid-row'>
             <div className='ms-Grid-col ms-sm12 ms-md12 ms-lg12'> {/* style={ this.styleGridPartiesDiv } */}
                <h3>Add Parties</h3>
            </div>
        </div>
        <div className='ms-Grid-row'>
            <div className='ms-Grid-col ms-sm11 ms-md12 ms-lg12' style={ this.styleGridPartiesDiv }>
              {/* <Parties contextHttpClient={this.props.contextHttpClient}
                        webAbsoluteURL={ this.props.webAbsoluteURL}
                        syncData={this.props.syncData} /> */}
                        <Signatures contextHttpClient={this.props.contextHttpClient}
                        webAbsoluteURL={ this.props.webAbsoluteURL}
                        enforceSigningSequence = { this.state.enforceSigningSequence }
                        // syncData={this.props.syncData} />
                        syncData = { this.syncFormDataHandler.bind(this) } />
            </div>
        </div>
      </div>
    );
  }
}

export default SignatureForm;


