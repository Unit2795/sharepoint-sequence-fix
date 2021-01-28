import * as React from 'react';
import * as ReactDom from 'react-dom';
import { HttpClient } from "@microsoft/sp-http";
import Signatures from '../../Signatures/Signatures';
import { ISignatureRow } from '../../Signatures/Signature/ISignatureRow';
import * as DragNDrop from '../../Helpers/DragDropContainer';

// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';


export interface IPartyDetailsProps {
    contextHttpClient: HttpClient;
    webAbsoluteURL: string;
    syncData: (formDataCol: ISignatureRow[]) => void;
  }

  export interface IPartyDetailsState {
    items: ISignatureRow[];
  }
class Parties extends React.Component<IPartyDetailsProps, IPartyDetailsState>{



  public constructor(props: IPartyDetailsProps) {
    super(props);
    this.state = {
      items: []
    };
  }




  public render(){


    //const items: ISignatureRow[] = [ ];


    return (
      // title="TestDragDrop"
      <div className="ms-Grid" dir="ltr">
        <DragNDrop.DragNDropContainer items={ this.state.items } title="" contextHttpClient={this.props.contextHttpClient}
                        webAbsoluteURL={ this.props.webAbsoluteURL}
                        syncData={this.props.syncData}>
          {/* <div>A</div>
          <div>B</div>
          <div>C</div>
          <div>D</div> */}
        </DragNDrop.DragNDropContainer>
      </div>

    );
  }
}

export default Parties;



/*
        const items = [
          {
            id: 1,
            index:1,
            color: "green",
            location: "Chicago",
            name: "Row 1",
            //description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
            height: 199,
            key: "item-0 Lorem ipsum dolor sit",
            shape: "circle",
            thumbnail: "//placehold.it/199x199",
            width: 199
          },
          {
            id: 2,
            index:2,
            color: "red",
            location: "Colorado",
            name: "Row 2",
            //description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in",
            height: 192,
            key: "item-1 Lorem ipsum dolor sit",
            shape: "triangle",
            thumbnail: "//placehold.it/192x192",
            width: 192
          },
          {
            id: 3,
            index:3,
            color: "yellow",
            location: "New York",
            name: "Row 3",
            //description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore",
            height: 231,
            key: "item-2 Lorem ipsum dolor sit",
            shape: "triangle",
            thumbnail: "//placehold.it/231x231",
            width: 231
          },
          {
            id: 4,
            index:4,
            color: "blue",
            location: "Dallas",
            name: "Row 4",
            //description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt",
            height: 198,
            key: "item-3 Lorem ipsum dolor sit",
            shape: "triangle",
            thumbnail: "//placehold.it/198x198",
            width: 198,
          },
          {
            id: 5,
            index:5,
            color: "orange",
            location: "Los Angeles",
            name: "Row 5",
            //description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in",
            height: 221,
            key: "item-4 Lorem ipsum dolor sit",
            shape: "triangle",
            thumbnail: "//placehold.it/221x221",
            width: 221
          }
        ];
    */
