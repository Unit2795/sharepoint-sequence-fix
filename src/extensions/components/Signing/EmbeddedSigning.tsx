import * as React from 'react';
import { IEmbeddedSigningSession } from './IEmbeddedSigningSession';
import { Spinner } from "office-ui-fabric-react";

export interface IEmbeddedSigningProps{
  embeddedSessionURL: string;
  isLoaderOnly: string;
}

export interface IEmbeddedSigningState{
  isLoading: Boolean;
}

export class EmbeddedSigning extends React.Component<IEmbeddedSigningProps, IEmbeddedSigningState> {
  // private _embeddedSessionURL: IEmbeddedSigningSession[] = [];
  private defaultStyleDiv = { height: "100% !important", width: "100% !important", overflow: "auto"};
  private defaultStyleFrame = { height: "99% !important", width: "99% !important", position: "absolute" };


  constructor(props: IEmbeddedSigningProps, state: IEmbeddedSigningState){
    super(props);
    this.state = {  isLoading: true };
  }

  public hideSpinner = () => {
    this.setState({  isLoading: false });
  }





  public render(): React.ReactElement<IEmbeddedSigningProps> {
    return(
      <div>
        {
          this.state.isLoading ? this.props.isLoaderOnly === "False"  ? (
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <Spinner label="Loading document..." />
            </div>
          ) :  (
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <Spinner label="Sending docs to e-Sign..." />
            </div>
          )
           : null
        }

        {
          this.props.isLoaderOnly === "False" ? (
          <div style={ this.defaultStyleDiv } data-role="content">
            {/* style={ this.defaultStyleFrame } */}
                    <iframe id="esignIframe"
                      src={ this.props.embeddedSessionURL }
                      style={{ width: "100%", height: "48rem" }}
                      frameBorder="0"
                      onLoad={this.hideSpinner}>
                    </iframe>
          </div>
        ) : null
        }
      </div>
    );
  }
}
