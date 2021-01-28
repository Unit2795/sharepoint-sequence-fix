import { ISignatureRow } from '../Signatures/Signature/ISignatureRow';
import { ISignatureFormData } from '../Signatures/Signature/ISignatureFormData';
import IspFileInfo from '../../eSignCommandSet/IspFileInfo';
import { HttpClient, SPHttpClient, IHttpClientOptions } from '@microsoft/sp-http';
import { sp } from "@pnp/sp";

export interface ISigningPartyParam{
    "firstName": string;
    "lastName": string;
    "emailId": string;
    "permission": string;
    "dialingCode": string;
    "mobileNumber": string;
    "sequence": number;
    "workflowSequence": number;
}




let accessToken='';
let bodyParam = '';
let fileNames = [];
let flowURLVal = '';

const SEND = "Send";
const SIGN_AND_SEND = "SignAndSend";
const PREVIEW_AND_SEND = "PreviewAndSend";


const initFlow = async (flowURL: String, httpClientOptions: IHttpClientOptions, contextHttpClient) => {
  //let fileBlob: Blob;
  let json;

  try{
    let response = await contextHttpClient.post(
      flowURL,
      HttpClient.configurations.v1,
      httpClientOptions
    );
    json = await response;

  }catch(err){
    console.log("initFlow Error : " + err.message);
  }

  return new Promise(resolve => resolve(json));
  };

  const getFlowURL = async()=>{
    let response;
    try{
        response = await sp.web.getStorageEntity("eSignGlobalProperty").then(res => {
        var eSignPropertyBag = JSON.parse(res.Value);
        flowURLVal = eSignPropertyBag.pdfConvertFlowURL;
        return flowURLVal;
      });
    }catch(err){
      console.log("Error getting flow url from tenant property");
      console.log(err);
    }

    return new Promise(resolve => resolve(response));
  };


const getHeader = () => {
  const requestHeaders: Headers = new Headers();
  return requestHeaders;
};

// Get File Contents
const getFileBlob = async (file, contextHttpClient: HttpClient, formData: FormData, webAbsoluteURL: String) => {
  const fileURL = file.fileURL;
  let fileName = file.fileName;
  let isPDF = true;

  // Call flow if it's not a pdf file.
  try{
      if(fileName.lastIndexOf(".") != -1){
        let fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);
        if(fileExt && fileExt.trim().toLowerCase() !== "pdf"){
            isPDF = false;
        }
      }

      if(!isPDF){
        try{
            let flowURL = flowURLVal;
            if(flowURL == ''){
              let flowURLTmp: any = await getFlowURL();
            }

            const flowRequestBody:string = JSON.stringify({
                "siteAddress": webAbsoluteURL,
                "fileIdentifier": file.fileURL.substring((webAbsoluteURL).length),
                "targetFileName": fileName
            });

            const flowRequestHeaders: Headers = new Headers();
            flowRequestHeaders.append('Content-type', 'application/json');

            const httpClientOptions: IHttpClientOptions = {
              body: flowRequestBody,
              headers: flowRequestHeaders
            };

            let response: any = await initFlow(flowURL, httpClientOptions, contextHttpClient);
            let fileBlob = await response.blob();

            let fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
            fileName = fileNameWithoutExt + ".pdf";

            formData.append("file", fileBlob, fileName);

        }catch(e){
          console.log("Error calling Power Automate : " + e.message);
        }
      }else{
        const response = await contextHttpClient.get(fileURL, SPHttpClient.configurations.v1);
        let fileBlob = await response.blob();
        formData.append("file", fileBlob, fileName);
      }

  }catch(e){
    console.log("Error in pdf conversion : " + e.message);
  }

  return formData;
/*
  const response = await contextHttpClient.get(fileURL, SPHttpClient.configurations.v1);
  let fileBlob = await response.blob();
  formData.append("file", fileBlob, fileName);

  return formData;
  */

};



const getFormBody = async (data, crntFileInfo, contextHttpClient, webAbsoluteURL) => {

  let formData = new FormData();


  let arrfileFetchCalls = [];
  fileNames = [];
  crntFileInfo.forEach(async (file) => {
    let fileName = file.fileName;
    if(fileName.lastIndexOf(".") != -1){
      let fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);
      if(fileExt && fileExt.trim().toLowerCase() === "pdf"){
          // file is pdf
          fileNames.push(file.fileName);
      }else{
        // replace file extn
        let fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
        fileNames.push(fileNameWithoutExt + ".pdf");
      }
    }

    arrfileFetchCalls.push( { fnName: getFileBlob, params: { file: file, contextHttpClient: contextHttpClient, formData: formData, webAbsoluteURL: webAbsoluteURL} });
  });

  data["fileNames"] = fileNames;
  formData.append("data", JSON.stringify(data));
  for(const fileBlob of arrfileFetchCalls) {
    formData = await fileBlob.fnName(fileBlob.params.file, fileBlob.params.contextHttpClient, fileBlob.params.formData, fileBlob.params.webAbsoluteURL);
  }



  return formData;

  };





  const createESignFolder = async (formBody, createFolderAPIUrl, contextHttpClient) => {
  let json;
  const httpClientOptions: IHttpClientOptions = {
    body: formBody,
    headers: getHeader()
  };

  try{
    let response = await contextHttpClient.post(
      createFolderAPIUrl,
      HttpClient.configurations.v1,
      httpClientOptions
    );
    json = await response.json();

  }catch(err){
    json = err;
  }

  return new Promise(resolve => resolve(json));
  };

  // Main function
  const createFolderHelper =  async (formData: ISignatureFormData, formDataCol: ISignatureRow[], crntFileInfo: IspFileInfo[], contextHttpClient: HttpClient, mode: String, webAbsoluteURL: String) => {

  let paritesParam: ISigningPartyParam[] = [];

  // get access token
  var tokenData = JSON.parse(localStorage.getItem('eSignAccessToken'));

  accessToken='';
  let createFolderURL = "https://www.esigngenie.com/esign/api/folders/createfolder?access_token=";
  if(tokenData && tokenData.access_token) {
    accessToken = tokenData.access_token;
    createFolderURL = createFolderURL + accessToken;
  }else{
    return  "Access token missing.";
  }

  let data;

  // Multi-file sending will have more than one ID's being passed.
  let ids: number[] = [];
  crntFileInfo.forEach(fileInfo => {
    ids.push(fileInfo.itemID);
  });
  // Remove leading ','
  let idString = ids.toString();//.substring(1);


  data = {
    "folderName":formData.folderName,
    "processTextTags":true,
    "processAcroFields":true,

    "custom_field1":{
      "name":"DocLibURL",
      "value":crntFileInfo[0].libURL + ":" + formData.accessToken
           },
    "custom_field2":{
      "name":"ID",
      "value":idString
           },
    "themeColor":"#0066cb",
    "parties":paritesParam
  };

  data["senderEmail"] = formData.senderEmail;


  // sign-in sequence
  data["signInSequence"] = formData.enforceSigningSequence;



  if(mode == SIGN_AND_SEND){

    data["createEmbeddedSigningSession"] = true;
    data["createEmbeddedSigningSessionForAllParties"] = true;

  } else if(mode == PREVIEW_AND_SEND){

    data["createEmbeddedSendingSession"] = true;
    data["fixRecipientParties"] = true;
    data["fixDocuments"] = false;
    data["sendSuccessUrl"] = crntFileInfo[0].fileURL.substring(0, crntFileInfo[0].fileURL.lastIndexOf("/"));
  } else{
    // Send (Send email - No embedded signing and sending session)
    data["sendNow"] = true;
  }

  formDataCol.forEach( formDataObj => {
    // check and add workflow sequence number

    let partyItem: ISigningPartyParam = {
      "firstName": '',
      "lastName": '',
      "emailId": '',
      "permission": '',
      "dialingCode": '',
      "mobileNumber": '',
      "sequence": 1,
      "workflowSequence": 1
    };
    partyItem.firstName = formDataObj.firstName;
    partyItem.lastName = formDataObj.lastName;
    partyItem.emailId = formDataObj.email;
    partyItem.permission = formDataObj.permission;
    partyItem.dialingCode = '+' + formDataObj.dialingCode;
    partyItem.mobileNumber = formDataObj.mobileNumber.split(' ').reduce((f,c)=> f + c.replace('(', '').replace(')', '').replace('-', ''), '');
    partyItem.sequence = formDataObj.id;

    if(formData.enforceSigningSequence){
      partyItem.workflowSequence = formDataObj.signingSequenceNumber;
    }

    paritesParam.push(partyItem);
  });



  let formBody = await getFormBody(data, crntFileInfo, contextHttpClient, webAbsoluteURL);
  let createFolderResponse: any = await createESignFolder(formBody, createFolderURL, contextHttpClient);

  return createFolderResponse;
};


export default createFolderHelper;
