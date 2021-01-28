import * as React from 'react';
import 'office-ui-fabric-react/dist/css/fabric.css';

import { ActionButton } from 'office-ui-fabric-react';
import { ISignatureRow } from './Signature/ISignatureRow';
import { HttpClient } from "@microsoft/sp-http";
import * as DragNDrop from '../Helpers/DragDropContainer';



export interface ISignaturesProps {
  syncData: (formDataCol: ISignatureRow[]) => void;
  contextHttpClient: HttpClient;
  webAbsoluteURL: string;
  enforceSigningSequence: boolean;
}

export interface ISignaturesState {
  rowCount: number;
  signatureRows: ISignatureRow[];
  isFirstLoad: boolean;
  isSaveFired: boolean;
  boxStyle: {};
  enforceSigningSequence: boolean;
  clearInput: boolean;
}

export class Signatures extends React.Component<ISignaturesProps, ISignaturesState> {

  private defaultStyle = { border: "2px solid #0078d4", padding: "10px", margin: "5px", borderRadius: "9px" };
  private successStyle = { border: "1px solid", padding: "10px", margin: "5px", boxShadow: "2px 1px 5px #31752f" };

  private items=[];
  private isAddNewRow: Boolean = false;
  private hasValidationError: Boolean = false;
  private isFirstSave: Boolean = true;

  constructor(props: ISignaturesProps, state: ISignaturesState) {
    super(props);

    this.state = {
      rowCount: 1,
      signatureRows: [],
      isFirstLoad: true,
      isSaveFired: false,
      boxStyle: this.defaultStyle,
      enforceSigningSequence: this.props.enforceSigningSequence,
      clearInput: false
    };

    //this.items = this.state.signatureRows;
    this.items = [
      {
        id: this.state.rowCount,
        index: this.state.rowCount,
        firstName: "",
        lastName: "",
        email: "",
        //inPersonSigningAdmin: "",
        permission: "",
        dialingCode: "",
        mobileNumber: "",
        boxStyle: {},
        peopleListData: {},
        signingSequenceNumber: 1
      }
    ];


  }

  public componentWillReceiveProps(nextProps) {
    if (this.props.enforceSigningSequence !== nextProps.enforceSigningSequence) {
      this.setState({
        enforceSigningSequence: nextProps.enforceSigningSequence
      });
     }


  }

  private syncRowOrder = (newCollection) => {
     console.log(newCollection);
     // re-arrange rows as per new index

     const arrangedCollection = [];
     const existingRowCopy = [ ...this.state.signatureRows ];

    newCollection.forEach(element => {
      var row = existingRowCopy.filter((existingRow) => {
        return existingRow.id == element.id;
      });

   // row[0].id = element.index; // TODO : Commented for testing
    row[0].index = element.index;
    arrangedCollection.push(row[0]);
    });

    this.setState({ signatureRows: arrangedCollection });

    this.items = [ ...arrangedCollection ];

  }

  // private signingSequenceChangedHandler = (event, value) => { };

  private saveRowHandler = (event, value) => {

    if(!value){
      return;
    }
    const newSignatureRow : ISignatureRow = {
      id: value.id,
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      //inPersonSigningAdmin: value.inPersonSigningAdmin,
      permission: value.permission,
      dialingCode: value.dialingCode,
      mobileNumber: value.mobileNumber,
      boxStyle: this.successStyle,
      peopleListData: value.peopleListData,
      index: value.id,
      signingSequenceNumber: value.signingSequenceNumber
    };
    let isSaved = false;

    if(this.isAddNewRow){
      if(value.id && value.firstName && value.lastName && value.email && value.permission && value.dialingCode && value.mobileNumber ) //&& value.inPersonSigningAdmin
         {
          let allSequence = this.state.signatureRows.map(s =>  s.signingSequenceNumber);
          let maxSequenceNumber = allSequence.reduce((a,b) => {
            return Math.max(a,b);
          });
          maxSequenceNumber += 1;
          this.items.push(
            {
              id: this.state.rowCount + 1,
              index: this.state.rowCount + 1,
              firstName: "",
              lastName: "",
              email: "",
              //inPersonSigningAdmin: "",
              permission: "",
              dialingCode: "",
              mobileNumber: "",
              boxStyle: {},
              peopleListData: {},
              signingSequenceNumber: maxSequenceNumber
            }
          );
          this.isAddNewRow = !this.isAddNewRow;

    }else{
        // end of value check
        this.hasValidationError = true;
        alert('All fields are required.');
        return;
    }
  }else{
    {
        const searchedRow = this.state.signatureRows.filter( row => {
        return row.id === value.id;
    });
if(searchedRow.length > 0){
  // row exists, update row
  const existingRowCopy = {
    ...this.state.signatureRows[searchedRow[0].id]
  };
  existingRowCopy.firstName = value.firstName;
  existingRowCopy.lastName = value.lastName;
  existingRowCopy.email = value.email;
  //existingRowCopy.inPersonSigningAdmin = value.inPersonSigningAdmin;
  existingRowCopy.permission = value.permission;
  existingRowCopy.dialingCode = value.dialingCode;
  existingRowCopy.mobileNumber = value.mobileNumber;
  existingRowCopy.id = value.id;
  existingRowCopy.index = value.id;
  existingRowCopy.signingSequenceNumber = value.signingSequenceNumber;

  if(value.peopleListData){
    existingRowCopy.peopleListData = value.peopleListData;
  }

  const allSignatures = [...this.state.signatureRows];
  allSignatures[searchedRow[0].id -  1] = existingRowCopy;

  this.setState({ signatureRows: allSignatures, isSaveFired: true, clearInput: false });
  isSaved = true;

  // Update DragDropSource for row edit

  //this.items = [ ...this.state.signatureRows ];
  this.items = [ ...allSignatures ];

}else {
  // add row
  const allSignatures = [...this.state.signatureRows];
  allSignatures.push(newSignatureRow);
  this.setState({ signatureRows: allSignatures, isSaveFired: true, clearInput: false });
  isSaved = true;

  // Update DragDropSource for new item
  this.items = [ ...allSignatures ];
}

if(isSaved) {
  //console.log('Form entry saved.');
  // this.props.syncData([ ...this.state.signatureRows ]);
}else {
  alert('Error in saving form.');
}


}

  }
}

  private deleteRowHandler = (event, value) => {
    // find and delete with row ID
    const deletedSignatureRow : ISignatureRow = {
      id: value.id,
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      permission: value.permission,
      dialingCode: value.dialingCode,
      mobileNumber: value.mobileNumber,
      boxStyle: this.successStyle,
      peopleListData: value.peopleListData,
      index: value.id,
      signingSequenceNumber: value.signingSequenceNumber
    };
    let isSaved = false;
    let isFirstLoad = false;

    if(value.id){
      const searchedRow = this.state.signatureRows.filter( row => {
        return row.id === value.id;
    });
    if(searchedRow.length > 0){
      // row exists, update row
      const existingRowCopy = {
        ...this.state.signatureRows[searchedRow[0].id]
      };

      const allSignatures = [...this.state.signatureRows];

      const newCollection = allSignatures.filter( signatureItem => {
        return signatureItem.id !== deletedSignatureRow.id;
      });
      if(newCollection.length === 0){
        isFirstLoad = true;
      }

      const sortedCollection = [];
      let counter = 1;
      newCollection.forEach(row => {
        row.id = counter;
        row.index = counter;
        counter += 1;
        sortedCollection.push(row);
      });

      // deleting last row
      if(sortedCollection.length <= 0){
        sortedCollection.push(
          {
            id: sortedCollection.length == 0 ? 1 : this.state.rowCount + 1,
            index: sortedCollection.length == 0 ? 1 : this.state.rowCount + 1,
            firstName: "",
            lastName: "",
            email: "",
            // inPersonSigningAdmin: "",
            permission: "",
            dialingCode: "",
            mobileNumber: "",
            boxStyle: {},
            peopleListData: {},
            signingSequenceNumber: 1
          }
        );

        this.setState({ signatureRows: sortedCollection, rowCount: 1, isSaveFired: true, isFirstLoad: isFirstLoad, clearInput: true });
        this.items = sortedCollection;
      }else{
        // when more than one row is present now need to clear input. Only use for 1st row
        this.setState({ signatureRows: sortedCollection, rowCount: this.state.rowCount - 1, isSaveFired: true, isFirstLoad: isFirstLoad, clearInput: false });
        this.items = sortedCollection;
      }

    isSaved = true;
    }else {
      // add row

      this.items.push(
        {
          id: this.state.rowCount + 1,
          index: this.state.rowCount + 1,
          firstName: "",
          lastName: "",
          email: "",
          // inPersonSigningAdmin: "",
          permission: "",
          dialingCode: "",
          mobileNumber: "",
          boxStyle: {},
          peopleListData: {},
          signingSequenceNumber: 1
        }
      );
    }

    if(isSaved) {
      //console.log('Form entry saved.');
      // this.props.syncData([ ...this.state.signatureRows ]);
    }else {
      console.log('Error in saving form.');
    }
    } else {// end of value check
      console.log('All fields are required.');
    }


  }

  public componentDidUpdate() {
    this.props.syncData([ ...this.state.signatureRows ]);

}

  // Add new row
  private addNewRowHandler() {

    // restrict additional rows unless existing ones are filled
    if(this.state.rowCount > this.state.signatureRows.length){
      return;
    }

    // check mmobile number
    if(this.state.signatureRows[this.state.signatureRows.length - 1].mobileNumber == ''){
      alert('Please enter a valid phone number');
      return;
    }

    // check if previous rows are non-empty
    var arrEmptyFieldValidationResult = this.state.signatureRows.map(currentRow => {
      return currentRow.email && currentRow.firstName && currentRow.lastName && currentRow.permission && currentRow.dialingCode && currentRow.mobileNumber;
    });
    var allNonEmptyFields = arrEmptyFieldValidationResult.reduce((prevValue, currentValue, index, arrAllRows) => {
        return prevValue && Boolean(currentValue);
    }, true);

    if(!allNonEmptyFields){
      alert('All fields are required.');
      return;
    }


    // Perform save on add new row
    this.isAddNewRow = true;
    // pass in the current row
    this.saveRowHandler(null, this.state.signatureRows[this.state.signatureRows.length -1 ]);

    if(this.hasValidationError){
      this.hasValidationError = false;
      this.isAddNewRow = !this.isAddNewRow;
      return;
    }

    let newRowCount = this.state.rowCount + 1;
    this.setState(
      { rowCount: newRowCount, isFirstLoad: false, isSaveFired: false }
      );

  }



  public render(): React.ReactElement<ISignaturesProps> {
    //let signatureElement;
    let newSignatureElement;
    if(this.state.isFirstLoad) {
      // First load
    }else
    {
      if(this.state.signatureRows.length <  1) {

      }
      else{
          if(!this.state.isSaveFired){

          }else{

          }

        }
    }
    return (
      <div className="ms-Grid" dir="ltr">


      <DragNDrop.DragNDropContainer items = { this.items }
        title = ""
        saveRowHandler = { this.saveRowHandler }
        deleteRowHandler = { this.deleteRowHandler }
        rowCount = { this.state.rowCount }
        boxStyle = { this.state.boxStyle }
        contextHttpClient = {this.props.contextHttpClient}
        webAbsoluteURL = { this.props.webAbsoluteURL}
        clearInput = { this.state.clearInput }
        isFirstLoad = { this.state.isFirstLoad }
        isSaveFired = { this.state.isSaveFired }
        signatureRows = { this.state.signatureRows }
        syncRowOrder = { this.syncRowOrder }
        enforceSigningSequence = { this.state.enforceSigningSequence }
      >
    </DragNDrop.DragNDropContainer>
       <div className='ms-Grid-row'>
          <div className='ms-Grid-col ms-sm1 ms-md1 ms-lg1'>
            <ActionButton
              iconProps={{ iconName: 'Add' }}
              onClick={ this.addNewRowHandler.bind(this) }
              allowDisabledFocus>
                Add Recipient
            </ActionButton>
          </div>
          <div className='ms-Grid-col ms-sm10 ms-md10 ms-lg10'></div>
        </div>
      </div>

      );
  }
}

export default Signatures;
