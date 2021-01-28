// require('DropBox.css');

import * as React from 'react';
// import * as ReactDom from 'react-dom';
import { Signature } from '../Signatures/Signature/Signature';
// import Signatures from '../Signatures/Signatures';
// import { Icon } from 'office-ui-fabric-react/lib/Icon';
// import { TextField } from 'office-ui-fabric-react/lib/TextField';


// Defines Simple List Element of Drag and Drop Container
export class DragNDropItem extends React.Component<any, any> {

  public itemData: any;
  public parentComp: any;

    constructor(props) {

        super(props);

        // Save item data with item
        let itemData = props.children;
        let parentComp = props.parentComp;

        // Add unique id to item

        // store modified item data
        this.itemData = itemData;
        this.parentComp = props.parentList;

    }



    // public componentWillUpdate(nextProps, nextState) {
    //   if(this.state === nextState){
    //     return false;
    //   }
    // }

    // Handle the start of the dragging action
    public handleDragStart(event) {

        let itemData = this.itemData;

        event.dataTransfer.setData("application/json", JSON.stringify(itemData));
        event.dataTransfer.effectAllowed = "move";
        // event.dataTransfer.dropEffect = "move";


        // remove element
        let newItemsState = this.parentComp.state.items.filter( (obj) => {
           // return obj.title != itemData.title;
           return obj.id != itemData.id;
        });

        var newState = {
            items: newItemsState
        };

        newState.items = newItemsState;


    }

    // Check if drop was successful or not
    public handleWasDraged(event) {

        event.preventDefault();

        if (event.dataTransfer.dropEffect !== "none") {

          //   var currentItem = this.itemData;
          //   var newState = {
          //     id: this.parentComp.state.id,
          //     items: this.parentComp.state.items
          // };
          //   // var newState = {
          //   //     title: this.parentComp.state.title,
          //   //     items: this.parentComp.state.items
          //   // };

          //   var items = newState.items.filter( (obj) => {
          //      // return obj.title !== currentItem.title;
          //      return obj.id !== currentItem.id;
          //   });

          //   newState.items = items;
          //     console.log("Setting parent comp state");
          //     console.log(newState);
          //   this.parentComp.setState(newState);

        }

    }

    public render() {
      let signatureElement;
      if(!this.props.items[this.props.index - 1].firstName && !this.props.items[this.props.index - 1].lastName && !this.props.items[this.props.index - 1].email
        && !this.props.items[this.props.index - 1].peopleListData.FirstName && !this.props.items[this.props.index - 1].permission
        && !this.props.items[this.props.index - 1].dialingCode && !this.props.items[this.props.index - 1].mobileNumber){
          signatureElement = (
            <div className="dropbox-item" ref="item" style={{ margin: "1rem" }}>
              <Signature id={ this.props.id } index={ this.props.index } saveRow={ this.props.saveRowHandler } deleteRow={ this.props.deleteRowHandler } boxStyle={ this.props.boxStyle }
                    firstName={''}
                    lastName={''}
                    email={''}
                    peopleListData={{}}
                    //inPersonSigningAdmin= {''}
                    permission={''}
                    dialingCode={''}
                    mobileNumber={''}
                    contextHttpClient={this.props.contextHttpClient}
                    webAbsoluteURL={this.props.webAbsoluteURL}
                    enforceSigningSequence = { this.props.enforceSigningSequence }
                    signingSequenceNumber={ this.props.signingSequenceNumber }
                    clearInput={ this.props.clearInput }
                    />
            </div>

          );
        }else{
          signatureElement = (
            <div className="dropbox-item" ref="item" style={{ margin: "1rem" }}>
              <Signature id={ this.props.id } index={ this.props.index } saveRow={ this.props.saveRowHandler } deleteRow={ this.props.deleteRowHandler } boxStyle={ this.props.boxStyle }
                    firstName={ this.props.items[this.props.index - 1].firstName }
                    lastName={ this.props.items[this.props.index - 1].lastName }
                    email={ this.props.items[this.props.index - 1].email }
                    peopleListData={ this.props.items[this.props.index - 1].peopleListData }
                    //inPersonSigningAdmin= { this.props.items[this.props.index - 1].inPersonSigningAdmin }
                    permission={ this.props.items[this.props.index - 1].permission }
                    dialingCode={ this.props.items[this.props.index - 1].dialingCode }
                    mobileNumber={ this.props.items[this.props.index - 1].mobileNumber }
                    contextHttpClient={this.props.contextHttpClient}
                    webAbsoluteURL={this.props.webAbsoluteURL}
                    enforceSigningSequence = { this.props.enforceSigningSequence }
                    signingSequenceNumber={ this.props.items[this.props.index - 1].signingSequenceNumber }
                    clearInput={ this.props.clearInput }
                    />
            </div>

          );
        }




      //console.log("DragNDropItem render state");
        return (
            <div>{ signatureElement }</div>
        );
    }

}



// Defines Drag and Drop container
export class DragNDropContainer extends React.Component<any, any> {

    public data: Array<any>;
    public items: Array<DragNDropItem>;
    public simpleList: any;
    public stateChanged: Boolean = false;
    constructor(props) {

        super(props);

        this.state = props;

    }

    // Hanlde Drag over events
    public handleDragOver(event) {

        event.preventDefault();
        event.dataTransfer.effectAllowed = "move";

    }

    public componentWillReceiveProps(nextProps) {
      this.setState({ items: nextProps.items });

    }

    // public componentDidUpdate() {
    //   //this.props.syncData([ ...this.state.signatureRows ]);
    //   console.log("State Changed - " + this.stateChanged);
    //   console.log(" [ DragNDropContainer ] componentDidUpdate fired.");
    // }

    // Handle Drop event
    public handleDrop(event) {

        event.preventDefault();

        let data = null;

        data = JSON.parse(event.dataTransfer.getData("application/json"));

        var prevRow;
        var newState = [];
        try{
          // prevRow = this.props.items.filter(i => i.id == event.target.firstChild.innerText)[0];
            prevRow = this.props.items.filter(i => i.id == event.target.parentElement.firstChild.innerText)[0];
        }catch(e){
          this.stateChanged = false;
          console.log(e);
        }

        //if(prevRow.id === data.id){
          if(prevRow.index === data.index){
          this.stateChanged = false;
          return;
        }

        if(prevRow.id == this.props.items[this.props.items.length - 1].id){

          // last position
          //newState = this.state.items.filter(i => i.id !== data.id);
          let counter = 1;
          this.props.items.forEach((item, index, arr) => {
            if(item.id !== data.id){
              item.index = counter;
              counter++;
              newState.push(item);
            }
          });
          // find dragged row
          const draggedRow = this.props.items.filter(row => {
            return row.id == data.id;
          });
          data = draggedRow[0];
          // add dragegd row to last position
          data.index = this.props.items.length;
          newState.push(data);
        //  this.setState({ items: newState});
          this.stateChanged = true;
        }else{
            // middle position
            var dataWithoutDraggedRow = this.props.items.filter(i => i.id !== data.id);
            let counter = 1;
            dataWithoutDraggedRow.forEach((item, index, arr) => {
              if(item.id != prevRow.id){
                item.index = counter;
                newState.push(item);
                counter++;
              }else{
                item.index = counter;
                counter++;
                newState.push(item);
                data.index = counter;
                counter++;
                newState.push(data);
              }
            });

       //     this.setState({ items: newState});
            this.stateChanged = true;
        }



        if(this.stateChanged){
          this.props.syncRowOrder(newState);
        }
    }

    // public shouldComponentUpdate(nextProps, nextState) {
    //   if(this.stateChanged) {
    //        return false;
    //   }
    //   return true;
    // }

    public render() {

        let index = 0;
        let dragDropItem;
        // console.log("render state");
        // console.log(this.state.items);
        if(this.stateChanged){
          dragDropItem = (
                  // <div className="dropbox-zone">
                  <div>
                    {
                        this.state.items.map(function (item) {
                            return <DragNDropItem parentList={this}
                            key={item.id}
                            id={ item.id }
                            index={item.index}
                            isFirstLoad={ this.props.isFirstLoad }
                            isSaveFired={ this.props.isSaveFired }
                            items={ this.props.items }
                            signatureRows={ this.props.signatureRows }
                            rowCount = { this.props.rowCount }
                            saveRowHandler = { this.props.saveRowHandler }
                            deleteRowHandler = { this.props.deleteRowHandler }
                            boxStyle={ this.props.boxStyle }
                            contextHttpClient={ this.props.contextHttpClient }
                            webAbsoluteURL={ this.props.webAbsoluteURL}
                            enforceSigningSequence = { this.props.enforceSigningSequence }
                            signingSequenceNumber = { item.signingSequenceNumber }
                            clearInput = { this.props.clearInput }
                            >
                                {item}
                            </DragNDropItem>;
                        }, this)
                    }
                </div>

          );
        }else{
          dragDropItem = (
                  // <div className="dropbox-zone">
                  <div>
                    {
                        this.props.items.map(function (item) {
                            return <DragNDropItem parentList={this}
                            key={item.id}
                            id={ item.id }
                            index={item.index}
                            isFirstLoad={ this.props.isFirstLoad }
                            isSaveFired={ this.props.isSaveFired }
                            items={ this.props.items }
                            signatureRows={ this.props.signatureRows }
                            rowCount = { this.props.rowCount }
                            saveRowHandler = { this.props.saveRowHandler }
                            deleteRowHandler = { this.props.deleteRowHandler }
                            boxStyle={ this.props.boxStyle }
                            contextHttpClient={ this.props.contextHttpClient }
                            webAbsoluteURL={ this.props.webAbsoluteURL}
                            enforceSigningSequence = { this.props.enforceSigningSequence }
                            signingSequenceNumber = { item.signingSequenceNumber }
                            clearInput = { this.props.clearInput }
                            >
                                {item}
                            </DragNDropItem>;
                        }, this)
                    }
                  </div>
          );
        }

        this.stateChanged = false;

        return (
          <div className="dropbox">
            { dragDropItem }
          </div>

        );
    }
    // syncData={this.props.syncData}
    // signatureElement={ this.props.signatureElement }
    // newSignatureElement={ this.props.newSignatureElement }

}
