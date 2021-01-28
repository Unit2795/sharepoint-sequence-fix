import * as React from 'react';
// import 'office-ui-fabric-react/dist/css/fabric.css';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { TextField, MaskedTextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { PeoplePickerNormal } from '../../Controls/PickerControl';
import { HttpClient } from "@microsoft/sp-http";
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DefaultPalette, Stack, IStackStyles, IStackTokens, IStackItemStyles } from 'office-ui-fabric-react';
import countryCodes from './CountryCode';


export interface ISignatureProps {
  saveRow: (event, val)=>void;
  deleteRow: (event, val)=>void;
  id: number;
  index: number;
  firstName: string;
  lastName: string;
  email: string;
  //inPersonSigningAdmin: string;
  permission: string;
  dialingCode: string;
  mobileNumber: string;
  boxStyle: {};
  contextHttpClient: HttpClient;
  webAbsoluteURL: string;
  peopleListData: IPersonaProps;
  enforceSigningSequence: boolean;
  signingSequenceNumber: string;
  clearInput: boolean;
}

export interface ISignatureState {
  id: number;
  index: number;
  firstName: string;
  lastName: string;
  email: string;
  //inPersonSigningAdmin: string;
  permission: string;
  dialingCode: string;
  mobileNumber: string;
  peopleListData: IPersonaProps;
  boxStyle: {};
  enforceSigningSequence: boolean;
  signingSequenceNumber: string;
  clearInput: boolean;
}

const dropdownStyles: Partial<IDropdownStyles> = {

};

const options: IDropdownOption[] = [
  { key: 'FILL_FIELDS_AND_SIGN', text: 'Fill Out Fields and Sign' },
  { key: 'FILL_FIELDS_ONLY', text: 'Fill Out Fields only' },
  { key: 'VIEW_ONLY', text: 'CC/View Only' },
  { key: 'SIGN_ONLY', text: 'Edit and Sign' }
];

const optionsCountryCodes = countryCodes();

export class Signature extends React.Component<ISignatureProps, ISignatureState> {

  private ishandlerEvent = false;
  private inputElement;
  private isSaveRequired = false;
  private enforceSigningSequecne = false;

  private stackItemStyles: IStackItemStyles = {
    root: {
      background: DefaultPalette.themePrimary,
      color: DefaultPalette.white,
      padding: 5,
    },
  };
  private itemAlignmentsStackStyles: IStackStyles = {
    root: {
      background: DefaultPalette.themeTertiary,
      height: 100,
    },
  };

  private itemAlignmentsStackTokens: IStackTokens = {
    childrenGap: 5,
    padding: 10,
  };

  constructor(props: ISignatureProps){
    super(props);
    this.state = {
      id: this.props.id,
      index: this.props.index,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      email: this.props.email,
      permission: this.props.permission,
      dialingCode: this.props.dialingCode,
      mobileNumber: this.props.mobileNumber,
      boxStyle: this.props.boxStyle,
      peopleListData: this.props.peopleListData,
      enforceSigningSequence: this.props.enforceSigningSequence,
      signingSequenceNumber: this.props.signingSequenceNumber,
      clearInput: this.props.clearInput
    };

    this.enforceSigningSequecne = this.props.enforceSigningSequence;
  }

  public componentWillReceiveProps(nextProps) {
    if (this.props.enforceSigningSequence !== nextProps.enforceSigningSequence ) {
      this.enforceSigningSequecne = nextProps.enforceSigningSequence;
     }

     if((this.props.id == nextProps.id) && (this.props.index == nextProps.index) &&
          (this.props.firstName !== nextProps.firstName ||
            this.props.lastName !== nextProps.lastName ||
            this.props.email !== nextProps.email ||
            this.props.dialingCode !== nextProps.dialingCode ||
            this.props.mobileNumber !== nextProps.mobileNumber ||
            this.props.permission !== nextProps.permission)){
              this.setState({
                  id: nextProps.id,
                  index: nextProps.index,
                  peopleListData: nextProps.peopleListData,
                  firstName: nextProps.firstName,
                  lastName: nextProps.lastName,
                  email: nextProps.email,
                  permission: nextProps.permission,
                  dialingCode: nextProps.dialingCode,
                  mobileNumber: nextProps.mobileNumber,
                  boxStyle: nextProps.boxStyle,
                  enforceSigningSequence: nextProps.enforceSigningSequence,
                  signingSequenceNumber: nextProps.signingSequenceNumber,
                  clearInput: nextProps.clearInput
                });
            }


  }

  public componentWillUpdate(nextProps, nextState) {

     if(!this.ishandlerEvent && (nextProps.id !== nextState.id ||
      nextProps.index !== nextState.index ||
      nextProps.firstName !== nextState.firstName ||
      nextProps.lastName !== nextState.lastName ||
      nextProps.email !== nextState.email ||
      nextProps.permission !== nextState.permission ||
      nextProps.dialingCode !== nextState.dialingCode ||
      nextProps.mobileNumber !== nextState.mobileNumber ||
      nextProps.enforceSigningSequence != nextState.enforceSigningSequence ||
      nextProps.signingSequenceNumber != nextState.signingSequenceNumber ||
      nextProps.clearInput != nextState.clearInput ||
      nextProps.boxStyle !== nextState.boxStyle)){
        this.setState({
          id: nextProps.id,
          index: nextProps.index,
          firstName: nextProps.firstName,
          lastName: nextProps.lastName,
          email: nextProps.email,
          permission: nextProps.permission,
          dialingCode: nextProps.dialingCode,
          mobileNumber: nextProps.mobileNumber,
          boxStyle: nextProps.boxStyle,
          enforceSigningSequence: nextProps.enforceSigningSequence,
          signingSequenceNumber: nextProps.signingSequenceNumber,
          clearInput: nextProps.clearInput
        });
        this.enforceSigningSequecne = nextProps.enforceSigningSequence;

      }
  }

  public componentDidUpdate(){

       if(this.isSaveRequired){
        this.isSaveRequired = !this.isSaveRequired;
        this.inputElement.click();
      }
  }

  private changeHandlerPermission = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    const value = item.key.toString();

    const newState = { ...this.state };
    newState["permission"] = value;
    this.setState(newState);
    this.ishandlerEvent = true;
    this.isSaveRequired = true;
  }

  private changeHandlerCountryCode = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    const value = item.key.toString();

    const newState = { ...this.state };
    newState["dialingCode"] = value;
    this.setState(newState);
    this.ishandlerEvent = true;
    this.isSaveRequired = true;
  }

  private changeHandlerOnBlur = (event, elementName) => {
    let seqNumber = event.target.value;

    if(elementName == "signingSequenceNumber"){
      if((!seqNumber || !seqNumber.trim()) || !(/^\d+$/.test(seqNumber))){
        seqNumber = 1;
        const newState = { ...this.state };
        newState[elementName] = seqNumber;
        this.setState(newState);
        this.ishandlerEvent = true;
        this.isSaveRequired = true;
      }
      else
      {
        let inputs = document.getElementsByClassName('sequence-number-input');
        let lastSeq = 1;
        for (let x = 0; x < inputs.length; x++)
        {
          // @ts-ignore
          let val = inputs[x].value;
          if(val == null || val == '') {
            // @ts-ignore
            inputs[x].value = 1;
          }
          let seqNo = parseInt(val);
          if(x == 0) {
            if(seqNo != 1) {
              // @ts-ignore
              inputs[x].value = 1;
              seqNo = 1;
            }
          }
          if(seqNo < lastSeq) {
            // @ts-ignore
            inputs[x].value = lastSeq;
            seqNo = lastSeq;
          } else if(seqNo > lastSeq+1) {
            // @ts-ignore
            inputs[x].value = lastSeq+1;
            seqNo = lastSeq+1;
          }

          lastSeq = seqNo;
        }
      }
    }

  }

  private changeHandler = (event, elementName) => {
    const newState = { ...this.state };
    newState[elementName] = event.target.value;
    this.setState(newState);
    this.ishandlerEvent = true;
  }

  private blurHandler = (event, elementName) => {

   if(elementName === 'mobileNumber'){
      if(event.target.value == '' || event.target.value.length == 0){
        return;
      }
  }
    const newState = { ...this.state };
    newState[elementName] = event.target.value;
    this.setState(newState);
    this.ishandlerEvent = true;
    this.isSaveRequired = true;
  }

  private onRowDelete = (event) => {
    const newState = { ...this.state };
    newState["firstName"] = '';
    newState["lastName"] = '';
    newState["email"] = '';
    newState["permission"] = '';
    newState["dialingCode"] = '';
    newState["mobileNumber"] = '';
    newState.peopleListData = {};
    this.ishandlerEvent = true;

    this.setState(newState);
  }



  private peoplePickerHandler = (value) => {
    const newState = { ...this.state };
    newState["firstName"] = value[0].FirstName;
    newState["lastName"] = value[0].LastName;
    newState["email"] = value[0].WorkEmail;
    newState.peopleListData = value[0];
    this.ishandlerEvent = true;

    if(this.state.clearInput){
      newState["clearInput"] = !this.state.clearInput;
    }
    this.setState(newState);
    // Fire save when on picke resolve
    this.inputElement.click();
  }




  public render(): React.ReactElement<ISignatureProps> {

    return(

      <div className='ms-Grid-row' style={{ display: "flex", flexFlow: "row wrap", alignItems: "center" }}>
      <div className='ms-Grid-col ms-sm2 ms-md2 ms-lg2' style={{width:"5%"}}>
       {

         this.enforceSigningSequecne
         && <TextField className={'sequence-number-input'} name="partySequence" value={ this.state.signingSequenceNumber } onChange={ (event) => this.changeHandler(event, 'signingSequenceNumber') }
                onBlur={ (event) => this.changeHandlerOnBlur(event, 'signingSequenceNumber') } />
       }
      </div>
      <div className="ms-Grid-col ms-sm10 ms-md10 ms-lg10" style={{width:"95%"}}>
      <div style={ this.props.boxStyle } key={ this.props.id }>
        <div className="ms-Grid">


          <div className='ms-Grid-row'>

          <div className='ms-Grid-col ms-sm1 ms-md1 ms-lg1 ms-smPush11 ms-mdPush11 ms-lgPush11' style={{height:"10px"}}>

              <ActionButton style={{ height: "5px", fontSize:"10px"}}
                  onClick={ (event) => this.props.deleteRow(event, {
                  id: this.state.id,
                  firstName: this.state.firstName,
                  lastName: this.state.lastName,
                  email: this.state.email,
                  peopleListData: this.state.peopleListData,
                  dialingCode: this.state.dialingCode,
                  mobileNumber: this.state.mobileNumber,
                  permission: this.state.permission})}
                  allowDisabledFocus>
                <Icon iconName="ChromeClose" />
              </ActionButton>


          </div>
        </div>
          <div className='ms-Grid-row'>
          <div className='ms-Grid-col ms-sm8 ms-md8 ms-lg8'>
              <label id="lblPeoplePicker">Search Parties</label>
              <PeoplePickerNormal  peoplePickerHandler={ this.peoplePickerHandler }
                    peopleListData = {this.state.peopleListData }
                    contextHttpClient={this.props.contextHttpClient}
                    clearInput={ this.state.clearInput }
                    webAbsoluteURL={this.props.webAbsoluteURL} />
          </div>
          <div className='ms-Grid-col ms-sm2 ms-md2 ms-lg2'>
              <button style={{ display:"none" }}
                ref={ input => { this.inputElement = input; } }
                onClick={ (event) => this.props.saveRow(event, {
                  id: this.state.id,
                  firstName: this.state.firstName,
                  lastName: this.state.lastName,
                  email: this.state.email,
                  peopleListData: this.state.peopleListData,
                  signingSequenceNumber: this.state.signingSequenceNumber,
                  dialingCode: this.state.dialingCode,
                  mobileNumber: this.state.mobileNumber,
                  permission: this.state.permission})}
              //  allowDisabledFocus
              >
                Save row
                </button>

          </div>
        </div>

          <div className='ms-Grid-row'>
          <div className='ms-Grid-col ms-sm4 ms-md4 ms-lg4'>
            <TextField label='First Name' name="fName" required value={ this.state.firstName } onChange={ (event) => this.changeHandler(event, 'firstName') }
              onBlur={ (event) => this.changeHandler(event, 'firstName') } />
          </div>
          <div className='ms-Grid-col ms-sm4 ms-md4 ms-lg4'>
            <TextField label='Last Name' name="lName" required value={ this.state.lastName }  onChange={ (event) => this.changeHandler(event, 'lastName') }
                onBlur={ (event) => this.blurHandler(event, 'lastName') } />
          </div>
          <div className='ms-Grid-col ms-sm4 ms-md4 ms-lg4'>
            <TextField label='Email' required name='email' value={ this.state.email } onChange={ (event) => this.changeHandler(event, 'email') }
              onBlur={ (event) => this.blurHandler(event, 'email') } />
          </div>

        </div>

          <div className='ms-Grid-row'>
        <div className='ms-Grid-col ms-sm4 ms-md4 ms-lg4'>
            <Stack horizontal disableShrink tokens={this.itemAlignmentsStackTokens} style={{ padding:'0px' }}>
              <Stack.Item align="stretch" grow={3}>
                  <Dropdown placeholder="Select an option" label="Phone" required options={ optionsCountryCodes} selectedKey={ this.state.dialingCode }
                    styles={dropdownStyles} onChange= { this.changeHandlerCountryCode } />
              </Stack.Item>
              <Stack.Item align="end" grow={3}>
                  <TextField label="" name='mobileNumber' type='number'
                      value={ this.state.mobileNumber }
                      onChange={ (event) => this.changeHandler(event, 'mobileNumber') }
                      onBlur={ (event) => this.blurHandler(event, 'mobileNumber') } />
              </Stack.Item>
            </Stack>
          </div>
        <div className='ms-Grid-col ms-sm4 ms-md4 ms-lg4'>
            <Dropdown placeholder="Select an option" label="Permission" required options={options} selectedKey={ this.state.permission }
              styles={dropdownStyles} onChange= { this.changeHandlerPermission } />
        </div>
        </div>

        </div>
      </div>
      </div>
    </div>

    );
  }
}



