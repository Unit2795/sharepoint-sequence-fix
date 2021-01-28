import * as React from "react";
import * as ReactDOM from "react-dom";
import { BaseDialog, IDialogConfiguration } from "@microsoft/sp-dialog";

import CreateFolderHelper from "../components/Helpers/CreateFolderHelper";
import IspFileInfo from '../eSignCommandSet/IspFileInfo';
import { EmbeddedSigning } from '../components/Signing/EmbeddedSigning';
import { IEmbeddedSigningSession } from '../components/Signing/IEmbeddedSigningSession';
import 'office-ui-fabric-react/dist/css/fabric.css';
import SignatureForm from '../components/SignatureForm/SignatureForm';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";


import {
  DialogContent,
  Label
} from "office-ui-fabric-react";

import { HttpClient } from "@microsoft/sp-http";
import { ISignatureRow } from "../components/Signatures/Signature/ISignatureRow";
import { ISignatureFormData } from "../components/Signatures/Signature/ISignatureFormData";

export interface IFolder {
  envelopeCompanyId: number;
  envelopeId: number;
}

export interface ISigningResults {
  result: string;
  message: string;
  folder: IFolder;
  embeddedSigningSessions: IEmbeddedSigningSession[];
  embeddedToken: string;
  embeddedSessionURL: string;
}


export interface ISignatureDialogContentProps {
  message: string;
  close: () => void;
  submit: (formDataCol: ISignatureRow[]) => void;
  selectedDocs: IspFileInfo[];
  contextHttpClient: HttpClient;
  _webAbsoluteURL: string;
  _isAuthenticated: boolean;
}

export interface ISignatureDialogContentState {
  _isFormSubmitted: boolean;
  _showCreateResult: boolean;
  _resultStatus: string;
  _resultDetails: string;
  _isSigningView: boolean;
  _resultData: ISigningResults;
  _mode: String;
  _folderName: string;
}

export class GetSignatureDialogContent extends React.Component<ISignatureDialogContentProps, ISignatureDialogContentState> {

  private _isAuthenticated = false;
  private formDataCol: ISignatureFormData;
  private folder: IFolder = {
    envelopeCompanyId: -1,
    envelopeId: -1
  };
  private embeddedSigningSessions: IEmbeddedSigningSession[]=[];
  private resultData: ISigningResults = {
    result: '',
    message: '',
    folder: this.folder,
    embeddedSigningSessions: this.embeddedSigningSessions,
    embeddedToken: '',
    embeddedSessionURL: ''
  };



  constructor(props: ISignatureDialogContentProps, state: ISignatureDialogContentState) {
    super(props);
    this._isAuthenticated = props._isAuthenticated;
    this.state = {
      _isFormSubmitted: false,
      _showCreateResult: false,
      _isSigningView: false,
      _resultStatus: '',
      _resultDetails: '',
      _resultData: this.resultData,
      _mode: "Send",
      _folderName: ''
    };
  }

  private syncDataHandler(formDataCol: ISignatureFormData) {
    this.formDataCol = formDataCol;
  }

  private saveState(type: String){
    const newState = { ...this.state };
      newState["_isFormSubmitted"] = true;
      newState["_showCreateResult"] = false;
      newState["_mode"] = type;
      this.setState(newState);
  }
  private sendToESignHandler(type: String) {
    if(this.formDataCol && this.formDataCol.signatureRows.length > 0){

      // check for empty rows

      var arrEmptyFieldValidationResult = this.formDataCol.signatureRows.map(currentRow => {
        return currentRow.email != '' && currentRow.firstName != ''
              && currentRow.lastName!= '' && currentRow.permission!= ''
              && currentRow.dialingCode!= '';

      });
      var allNonEmptyFields = arrEmptyFieldValidationResult.reduce((prevValue, currentValue, index, arrAllRows) => {
          return prevValue && Boolean(currentValue);
      }, true);

      // check access token
      try{
        var tokenData = JSON.parse(localStorage.getItem('eSignAccessToken'));

        if(tokenData && tokenData.access_token) {
          this.formDataCol.accessToken = tokenData.access_token;
        }else{
          console.log("Error fetching access token from ocal storage");
          alert("Access token unavailable. Terminating document submission.");
          return;
        }
      }catch(err){
        console.log("Error fetching access token from ocal storage");
        console.log(err);
        alert("Access token unavailable. Termination document submission.");
      }


      // check phone field

      this.formDataCol.signatureRows.forEach((currentRow, index)=>{

        if(currentRow.mobileNumber == ''){
          allNonEmptyFields = false;
        }
      });

      if(!allNonEmptyFields){
        alert('All fields are required.');
        return;
      }else {
      }

      const onSuccess = (currentUser) => {
        let loggedInUserEmail = currentUser ? currentUser.Email : '';
        if(loggedInUserEmail){

            // Add sender email to formData
            this.formDataCol["senderEmail"] = loggedInUserEmail;

            if(type == 'SignAndSend'){
              // Only allow SignAndSend if current user email is in party email.
              let partyEmail = this.formDataCol.signatureRows.filter(row => {
                return row.email.trim().toLocaleLowerCase() === loggedInUserEmail.trim().toLocaleLowerCase();
              });

              if(partyEmail && partyEmail.length > 0){
                this.saveState(type);
              }else{
                alert('Party email should contain current user email for "Sign And Send"');
                return;
              }

            }else{

              this.saveState(type);

            }

          }else{
            alert('Error fetching current user email.');
            return;
          }
      };

      const onFailure = (error) => {
        alert('Error fetching current user email.');
        return;
      };

      sp.web.currentUser.get().then(onSuccess, onFailure);

    }else{
        alert("Invalid form data");
    }
  }

  private openSigningView() {
    this.setState({ _isSigningView: true });
  }

  public componentDidUpdate() {

    if(this.state._showCreateResult){
      return;
    }

    (async () =>  {

      const apiResponse: any = await CreateFolderHelper(this.formDataCol, this.formDataCol.signatureRows, this.props.selectedDocs, this.props.contextHttpClient, this.state._mode, this.props._webAbsoluteURL);

      if(apiResponse.result == "success"){
        if(this.state._mode == "SignAndSend"){
          this.resultData.result = apiResponse.result;
          this.resultData.message = apiResponse.message;
          this.resultData.folder.envelopeId = apiResponse.folder.envelopeId;
          this.resultData.folder.envelopeCompanyId = apiResponse.folder.envelopeCompanyId;

          this.resultData.embeddedSigningSessions = apiResponse.embeddedSigningSessions;
        }else if(this.state._mode == "PreviewAndSend"){
          this.resultData.result = apiResponse.result;
          this.resultData.message = apiResponse.message;
          this.resultData.folder.envelopeCompanyId = apiResponse.folder.envelopeCompanyId;
          this.resultData.embeddedSigningSessions = apiResponse.embeddedSigningSessions;

          this.resultData.embeddedToken = apiResponse.embeddedToken;
          this.resultData.embeddedSessionURL = apiResponse.embeddedSessionURL;
        }else if(this.state._mode == "Send"){
          this.resultData.result = apiResponse.result;
          this.resultData.message = apiResponse.message;
          this.resultData.folder.envelopeId = apiResponse.folder.envelopeId;
          this.resultData.folder.envelopeCompanyId = apiResponse.folder.envelopeCompanyId;
        }
      }else{
        console.log('Error calling eSign. Error : ' + apiResponse.error_description);
        this.resultData.message = apiResponse.error_description;
      }


      const updateAndTakeAction = () => {
        if(this.resultData.result === 'success') {
          this.setState({
            _showCreateResult: true,
            _resultStatus: 'Success',
            _resultDetails: apiResponse.message,
            _resultData: this.resultData
          });
        }else{
          this.setState({
            _showCreateResult: true,
            _resultStatus: 'Error',
            _resultDetails: apiResponse.message
          });
        }
      };
      // update folder link URL
      if(apiResponse.result == "success"){

        try{
              let hyperLinkFieldDesc = apiResponse.folder.folderName;
              let arrFolderNames = hyperLinkFieldDesc.split(",");
              let getFieldUpdates = await this.hyperLinkFieldPayload(arrFolderNames, apiResponse);

              }catch(e){
                console.log('Error making SP hyperlink update request');
                console.log(e);
              }

        }
        updateAndTakeAction();
    })();
  }

  private hyperLinkFieldPayload = async (arrFolderNames, apiResponse) => {
    let arrUpdateCalls = [];
    let responseData;
    arrFolderNames.forEach(async (folderName, index)=> {

      //let hyperLinkFieldURL = apiResponse.folder.folderAccessURLForAuthor;
      let hyperLinkFieldURL =  apiResponse.folder.envelopePartyPermissions[0].folderAccessURL;
      arrUpdateCalls.push({
        fnName: this.updateFileHyperLink,
        params: {
          index: index,
          folderName: folderName,
          hyperLinkFieldURL: hyperLinkFieldURL
        }
      });
    });

    for(const fileUpdate of arrUpdateCalls) {
      responseData = await fileUpdate.fnName(fileUpdate.params.index, fileUpdate.params.folderName, fileUpdate.params.hyperLinkFieldURL);
    }

    return responseData;


  }
  private updateFileHyperLink = async(index, folderName, hyperLinkFieldURL) => {

    let response = await sp.web.lists.getById(this.props.selectedDocs[index].libGUID).items.getById(this.props.selectedDocs[index].itemID).update({
        eSignGenieSignedDocsLink: {
            "__metadata": { type: "SP.FieldUrlValue" },
            Description: folderName,
            Url: hyperLinkFieldURL
        }
    });

    return response;
  }

  public render(): JSX.Element {
    let dialogContentHTML;
    if(this.state._isFormSubmitted) {

      if(this.state._showCreateResult){
        if(this.state._mode == "Send"){
          if(this.state._resultStatus == "Error"){
            dialogContentHTML = (
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <Label>Sorry. Something went wrong.</Label>
              </div>
            );
          }else{


          dialogContentHTML = (
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <Label>{ this.state._resultDetails }</Label>
            </div>
          );
          }
        }else {
          if(this.state._resultStatus == "Error"){
            dialogContentHTML = (
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <Label>Sorry. Something went wrong.</Label>
              </div>
            );
          }else if(this.state._mode == "SignAndSend"){

            dialogContentHTML = (
              <EmbeddedSigning embeddedSessionURL={ this.state._resultData.embeddedSigningSessions[0].embeddedSessionURL } isLoaderOnly="False" />
            );
          }else if(this.state._mode == "PreviewAndSend"){
            dialogContentHTML = (
              <EmbeddedSigning embeddedSessionURL={ this.state._resultData.embeddedSessionURL } isLoaderOnly="False" />
            );
          }
        }
      }else{
        dialogContentHTML = (
          // <div className="ms-G
          <EmbeddedSigning embeddedSessionURL="" isLoaderOnly="True" />
        );
      }
      // show signing progress

    }else {
      // display form
      dialogContentHTML = (

        <SignatureForm selectedDocs={this.props.selectedDocs}
                        syncData={formDataCol => this.syncDataHandler(formDataCol)}
                        contextHttpClient={this.props.contextHttpClient}
                        webAbsoluteURL={ this.props._webAbsoluteURL}
                        onSend={ this.sendToESignHandler.bind(this, "Send") }
                        onSignAndSend={ this.sendToESignHandler.bind(this, "SignAndSend") }
                        onPreviewAndSend={ this.sendToESignHandler.bind(this, "PreviewAndSend") }
                        onClose={this.props.close}
                        />

      );
    }
    return (
      <DialogContent
        title="eSign Genie Sending Information"
        subText={this.props.message}
        onDismiss={this.props.close}
        showCloseButton={true} >
        { dialogContentHTML }
      </DialogContent>
    );
  }

  private ishandlerEvent = false;

  private changeHandler = (event, elementName) => {
    const newState = { ...this.state };
    newState[elementName] = event.target.value;
    this.setState(newState);
    this.ishandlerEvent = true;
  }
}

export default class GetSignatureDialog extends BaseDialog {
  public message: string;
  public selectedDocs: IspFileInfo[];
  public contextHttpClient: HttpClient;
  public _isAuthenticated: boolean;
  public _webAbsoluteURL: string;
  // private showForm = true;

  constructor(){
    super({isBlocking: true});
  }

  public getConfig(): IDialogConfiguration {
    return {
      isBlocking: false
    };
  }

  protected onAfterClose(): void {
    super.onAfterClose();

    // Clean up the element for the next dialog
    ReactDOM.unmountComponentAtNode(this.domElement);
  }

  private _submit = (formDataCol: ISignatureRow[]) => {
    this.close();
  }

  public render(): void {
    ReactDOM.render(
      <GetSignatureDialogContent
        close={this.close}
        message={this.message}
        submit={this._submit}
        selectedDocs={this.selectedDocs}
        contextHttpClient={this.contextHttpClient}
        _isAuthenticated={this._isAuthenticated}
        _webAbsoluteURL={this._webAbsoluteURL}
      />
      ,this.domElement
    );
  } // end of render
}
