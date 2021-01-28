import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';

import './fabric.min.css';
import './ESignCommandSetCommandSet.module.scss';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
  RowAccessor
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
// import * as strings from 'ESignCommandSetCommandSetStrings';
import GetSignatureDialog from '../eSignDialogs/getSignaturesDialog';
import { HttpClient } from '@microsoft/sp-http';
import AuthCodeDialog from '../eSignDialogs/AuthCodeDialog';
import IspFileInfo from './IspFileInfo';


/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IESignCommandSetCommandSetProperties {
  // This is an example; replace with your own properties
  getSignatures: string;
  checkStatus: string;
  viewDocument: string;
  contextHttpClient: HttpClient;
}

const LOG_SOURCE: string = 'ESignCommandSetCommandSet';

export default class ESignCommandSetCommandSet extends BaseListViewCommandSet<IESignCommandSetCommandSetProperties> {
  private _webAbsoluteURL: string;
  private isAuthenticated = false;

  @override
  public onInit(): Promise<void> {
    if(this.context.pageContext.list.serverRelativeUrl.indexOf('eSign Genie Documents') == -1){
      return;
    }else{
      var tokenData = JSON.parse(localStorage.getItem('eSignAccessToken'));
      if(tokenData && tokenData.access_token) {
        this.isAuthenticated = true;
      }else{
        // localStorage.setItem('ESignSharePointWebHook', JSON.stringify("False"));
      }
    }
    Log.info(LOG_SOURCE, 'Initialized ESignCommandSetCommandSet');

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      // compareOneCommand.visible = event.selectedRows.length === 1;
    }

  }

  private authenticateUser(): void{
    Dialog.alert(`${this.properties.getSignatures}`);
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {

      const openModalHandler = () => {
      let selectedFiles: IspFileInfo[] = [];
      let renderForm = null;
      // let isAuthenticated = false;
      var tokenData = JSON.parse(localStorage.getItem('eSignAccessToken'));
      if(tokenData && tokenData.access_token) {
        this.isAuthenticated = true;
      }
      // Default client ID/ Secret to initiate OAuth
      const _clientID = "602ff33d0e1441f4bcb088c99fa43d2d";
      const _clientSecret = "ca1b7e31197a411586f6c90e43685ef0";

      const _redirectURI = "https://royy2020.sharepoint.com/sites/eSign/SitePages/eSignGenieAuthenticationPage.aspx";
      const _stateVal = (new Date()).getMilliseconds() + Math.floor(1000 + Math.random() * 90000);
      const _eSignURL = `https://www.esigngenie.com/esign/oauth2/authorize?client_id=${_clientID}&redirect_uri=${_redirectURI}&scope=read-write&response_type=code&state=${_stateVal}`;

      const _accessTokenURL = "https://www.esigngenie.com/esign/api/oauth2/access_token";

      // const _createWebHookChannelURL = "https://www.esigngenie.com/esign/api/webhook/createwebhookchannel";
      const _createWebHookChannelURL = "https://cors-anywhere.herokuapp.com/https://www.esigngenie.com/esign/api/webhook/createwebhookchannel"; // workaround URL provided by David.




      if(!this.isAuthenticated) {
        const dialogAuthCode: AuthCodeDialog = new AuthCodeDialog("", false);
        dialogAuthCode._eSignURL = _eSignURL;
        dialogAuthCode._createWebHookChannelURL = _createWebHookChannelURL;
        dialogAuthCode._stateVal = _stateVal;
        dialogAuthCode.contextHttpClient = this.context.httpClient;
        dialogAuthCode._clientID = _clientID;
        dialogAuthCode._redirectURI = _redirectURI;
        dialogAuthCode._clientSecret = _clientSecret;
        dialogAuthCode._accessTokenURL = _accessTokenURL;
        dialogAuthCode.show().then(() => {

        });
      }else
      {
          event.selectedRows.forEach((row: RowAccessor, index: number) => {
            let serverURL = '';
            let fileURL = '';
            let tmpServerURL = '';
            let libURL = '';
            let libGUID = '';
            let relativeDocPath = '';
            let folderPath = '';


            tmpServerURL = row.getValueByName('ServerRedirectedEmbedUrl');
            if(tmpServerURL.indexOf('/sites/') != -1){
              serverURL = tmpServerURL.substring(0, tmpServerURL.indexOf('/sites/'));
            }

            fileURL = serverURL + row.getValueByName('FileRef');
            libURL = this.context.pageContext.site.absoluteUrl.replace(this.context.pageContext.site.serverRelativeUrl, "") + this.context.pageContext.list.serverRelativeUrl;
            libGUID = this.context.pageContext.list.id.toString();
            relativeDocPath = fileURL.replace(libURL,"");
            folderPath = relativeDocPath.substring(0, relativeDocPath.lastIndexOf("/"));

            if(folderPath.length > 0){
              libURL += "?" + folderPath;
            }

            let crntFileInfo: IspFileInfo = {
              fileName: row.getValueByName('FileLeafRef'),
              fileURL: fileURL,
              libURL: libURL,
              libGUID: libGUID,
              itemID: event.selectedRows[index].getValueByName("ID")
            };
            selectedFiles.push(crntFileInfo);
          });

          const dialog: GetSignatureDialog = new GetSignatureDialog();
          dialog.message = '';

          // eSign props

          dialog.selectedDocs = selectedFiles;
          dialog.contextHttpClient = this.context.httpClient;
          dialog._isAuthenticated = this.isAuthenticated;
          dialog._webAbsoluteURL = this._webAbsoluteURL;

          dialog.show().then(() => {
          });
      }


    };

    switch (event.itemId) {
      case 'COMMAND_1':
        // this.authenticateUser();
        let selectedFiles: string[] = [];
        if(event.selectedRows.length > 0){
          this._webAbsoluteURL = `${this.context.pageContext.web.absoluteUrl}`;
          openModalHandler();
        }
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}

