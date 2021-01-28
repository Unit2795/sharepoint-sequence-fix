import * as React from 'react';

const document = (props) => {

  const styleDiv = {
    display: "flex"
 };

  return(
    <div style={ styleDiv }>
      <span>{ props.itemID }</span>.&nbsp;<span>{ props.fileName }</span>
      {/* <span>{ props.itemID }</span> */}
    </div>
  );
};

export default document;
