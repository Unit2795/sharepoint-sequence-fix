import * as React from 'react';
import IspFileInfo from '../../../eSignCommandSet/IspFileInfo';
import Document from './Document/Document';


export interface IDocumentListProps {
  selectedDocs: IspFileInfo[];
}

export interface IDocumentListState{

}



class DocumentList extends React.Component<IDocumentListProps, IDocumentListState> {
  constructor(props){
    super(props);
  }


  private styleDocDiv = {
    marginLeft: "11px"
   };



  public render(){
    // console.log(this.props.selectedDocs);
    const docList = this.props.selectedDocs.map((document, index) => {
      return <Document fileName={ document.fileName } itemID={ index + 1 } key={ index } />;
    });


    return(
      <div style={ this.styleDocDiv }>{ docList }</div>
    );
  }

}

export default DocumentList;

/*
fileName: "esg API 3rd party integration V3.pdf"
fileURL: "https://royy2020.sharepoint.com/sites/eSign/eSign Genie Docs/esg API 3rd party integration V3.pdf"
itemID: "1"
libURL: "https://royy2020.sharepoint.com/sites/eSign/eSign Genie Docs"
*/

  // private _onRenderCell = (item: IspFileInfo, index: number): JSX.Element => {
  //   return(<div></div>);
  //   return (
  //     <div data-is-focusable={true}>
  //       <div className={styles.itemContent}>
  //         {index + 1} &nbsp; {item.fileName}
  //       </div>
  //     </div>
  //   );
  // }

  // import { List }  from "office-ui-fabric-react";
// import {
//   mergeStyleSets,
//   getTheme,
//   normalize
// } from "office-ui-fabric-react/lib/Styling";



// const styles = mergeStyleSets({
//   container: {
//     overflow: "auto",
//     maxHeight: 400,
//     marginTop: 10,
//     selectors: {
//       ".ms-List-cell:nth-child(odd)": {
//         height: 50,
//         lineHeight: 50,
//         background: theme.palette.neutralLighter
//       },
//       ".ms-List-cell:nth-child(even)": {
//         height: 25,
//         lineHeight: 25
//       }
//     }
//   },
//   itemContent: [
//     theme.fonts.medium,
//     normalize,
//     {
//       position: "relative",
//       display: "block",
//       borderLeft: "3px solid " + theme.palette.themePrimary,
//       paddingLeft: 27
//     }
//   ]
// });
