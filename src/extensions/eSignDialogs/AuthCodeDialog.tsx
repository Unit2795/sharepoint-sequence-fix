import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration} from '@microsoft/sp-dialog';
import { HttpClient, HttpClientResponse , IHttpClientOptions } from '@microsoft/sp-http';

import { sp } from "@pnp/sp";

// import styles from './AuthCodeDialog.module.scss';

// import { mergeStyleSets, getTheme, normalize } from 'office-ui-fabric-react/lib/Styling';
// import { escape } from '@microsoft/sp-lodash-subset';
import {
  PrimaryButton,
  DialogFooter,
  DialogContent
  } from 'office-ui-fabric-react';

interface IAuthCodeDialogContentProps {
  close: () => void;
  onLoadHandler: (event) => void;
  _clientID: string;
  _clientSecret: string;
  _eSignURL: string;
  _createWebHookChannelURL : string;
  _authCode: string;
  _stateVal: number;
  // _isAuthCodeAvailable: boolean;
  _accessTokenURL: string;
  contextHttpClient: HttpClient;
   _redirectURI: string;
   getAccessToken: (string, boolean) => void;
}



class AuthCodeDialogContent extends React.Component<IAuthCodeDialogContentProps, {}> {
  constructor(props) {
    super(props);
  }
  // sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
  public render(): JSX.Element {
    return <DialogContent
    title='eSign Provide App Access'
    onDismiss={ this.props.close }
    showCloseButton={ true }>
      <iframe id='eSignApprovalFrame' onLoad={event => this.props.onLoadHandler(event)}
                      src={this.props._eSignURL}
                      style={{ width: "100%", height: "48rem" }} />
                      <DialogFooter>
      <PrimaryButton text='Close' title='Close' onClick={this.props.close} />
      {/* <PrimaryButton text='Close' title='Close' onClick={ this.props.close } /> */}
    </DialogFooter>
    </DialogContent>;
  }


}



export default class AuthCodeDialog extends BaseDialog {

  public _clientID: string;
  public _clientSecret: string;
  public _eSignURL: string;
  public _authCode: string;
  public _stateVal: number;
  // public _isAuthCodeAvailable: boolean = false;
  public _accessTokenURL: string;
  public contextHttpClient: HttpClient;
  public _redirectURI: string;
  public _createWebHookChannelURL: string;

  constructor(_authCode: string, _isAuthCodeAvailable: boolean) {
    super();
    this._authCode = _authCode;
    this.onMessageReceived = this.onMessageReceived.bind(this);
    this.bindEvents();

    // this._isAuthCodeAvailable = _isAuthCodeAvailable;
  }


    public getAccessToken(authCode: string, isAuthCodeAvailable: boolean) {
      if(isAuthCodeAvailable) {

        const body: string = `grant_type=authorization_code&client_id=${this._clientID}&client_secret=${this._clientSecret}&code=${authCode}&redirect_uri=${this._redirectURI}`;
        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/x-www-form-URLencoded');

        const httpClientOptions: IHttpClientOptions = {
          body: body,
          headers: requestHeaders
        };

        this.contextHttpClient.post(
          this._accessTokenURL,
          HttpClient.configurations.v1,
          httpClientOptions
        ).then((response: HttpClientResponse) => {
          response.json()
          .then((responseJSON: JSON) => {
            // Update webhook
            var iswebHookSetForAccount = JSON.parse(localStorage.getItem('ESignSharePointWebHook'));
            if(iswebHookSetForAccount === "True") {
              // update eSign access token only.
              localStorage.setItem('eSignAccessToken', JSON.stringify(responseJSON));
              this.close();
            }else{
              try{

                // Set WebHook flag to false
                localStorage.setItem('ESignSharePointWebHook', JSON.stringify("False"));

                sp.web.getStorageEntity("eSignGlobalProperty").then(res => {
                var eSignPropertyBag = JSON.parse(res.Value);
                var webHookURLVal = eSignPropertyBag.webHookURL;
                  if(webHookURLVal === '' || webHookURLVal === undefined || webHookURLVal === null || webHookURLVal.length <= 0){
                    alert('Please configure eSign Flow for webHook');
                    this.close();
                    return;
                  }
                // Create WebHook Channel
                let dataWebHook;
                dataWebHook = {
                "channelName": "ESignSharePointWebHook",
                "webhookUrl": webHookURLVal,
                // "webhookSecret":"xyz",
                "webhookLevel":"Account",
                "events": {
                  "folder_sent":true,
                  "folder_viewed":true,
                  "folder_signed":true,
                  "folder_cancelled":true,
                  "folder_executed":true,
                  "folder_deleted":true
                }
              };

              let authHeaderVal = 'Bearer ' + JSON.parse(JSON.stringify(responseJSON)).access_token;
              const requestHeadersWebHook: Headers = new Headers();
              requestHeadersWebHook.append('Content-type', 'application/json');
              requestHeadersWebHook.append('Authorization', authHeaderVal);

              const httpClientOptionsWebHook: IHttpClientOptions = {
                body: JSON.stringify(dataWebHook),
                headers: requestHeadersWebHook
              };


              this.contextHttpClient.post(
                this._createWebHookChannelURL,
                HttpClient.configurations.v1,
                httpClientOptionsWebHook
              ).then((responseWebHook: HttpClientResponse) => {
                responseWebHook.json()
                .then((responseWebHookJSON: JSON) => {
                  // Update both - access token and webhook flag
                  localStorage.setItem('eSignAccessToken', JSON.stringify(responseJSON));
                  localStorage.setItem('ESignSharePointWebHook', JSON.stringify("True"));
                //localStorage.setItem('ESignSharePointWebHookChannelId', JSON.stringify("True"));
                  this.close();
                  return;
                });
              }, (error) => {
                console.log("Error setting WebHook Channel");
                console.log(error);
                localStorage.setItem('ESignSharePointWebHook', JSON.stringify("False"));
                alert('Error creating webHook channel. Check console for detailed error message.');
                this.close();
                return;
              });

                });
              }catch(err){
                console.log("Error getting Webhook url from tenant property. Check console for detailed error message.");
                console.log(err);
                alert("Error getting Webhook url from tenant property. Check console for detailed error message.");
                this.close();
                return;
              }

             // return new Promise(resolve => resolve(response));


              // this.close();
            }



          });
        });

      }
    }


private bindEvents() {

}

private onMessageReceived(event) {
}


    public onLoadHandler(event) {
      let frameURL = '';
     try{
        try{
          frameURL =  event.currentTarget.contentWindow.location.href;
          if(frameURL.indexOf("code=") != -1 && frameURL.indexOf("state=") != -1){
            const url = new URL(frameURL);
            const codeResponse = url.searchParams.get('code');
            const stateResponse = url.searchParams.get('state');

            if(parseInt(stateResponse) === this._stateVal) {
              this.getAccessToken(codeResponse, true);
           }
          }
        }catch(e){

          //console.log(e);

          var signInData = JSON.parse(localStorage.getItem('eSignLoginData'));

          if(signInData && signInData.frameURL) {
            frameURL = signInData.frameURL;
            const url = new URL(frameURL);
            const codeResponse = url.searchParams.get('code');
            const stateResponse = url.searchParams.get('state');

            if(parseInt(stateResponse) === this._stateVal) {
              this.getAccessToken(codeResponse, true);
           }
          }else{
            console.log("Error fetching access token from local storage");
            //alert("Access token unavailable. Terminating document submission.");
            return;
          }
        }
      }catch(error){
        //console.log('Error reading eSign token from frame element.');
        console.log(error);
     }
    }
      public render(): void {

        ReactDOM.render(<AuthCodeDialogContent
          close={ this.close }
          onLoadHandler = { this.onLoadHandler }
          _clientID = {this._clientID }
          _clientSecret = {this._clientSecret }
          _eSignURL={ this._eSignURL }
          _createWebHookChannelURL = { this._createWebHookChannelURL }
          _authCode = {this._authCode }
          _stateVal = { this._stateVal }
          _accessTokenURL = {this._accessTokenURL }
          contextHttpClient = {this.contextHttpClient }
          _redirectURI = {this._redirectURI }
          getAccessToken = { this.getAccessToken }
          />, this.domElement);
  } // end of render

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

  private _submit = () => {
  this.close();
  }


  private _onClick(): void {
    this.close();
  }

  private _onDlgDismiss(): void {
  }
}
