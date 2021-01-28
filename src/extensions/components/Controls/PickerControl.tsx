import * as React from 'react';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { IBasePicker, IBasePickerSuggestionsProps, NormalPeoplePicker, CompactPeoplePicker, ValidationState } from 'office-ui-fabric-react/lib/Pickers';
import { HttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
// import { people, mru } from '@uifabric/example-data';
// import 'office-ui-fabric-react/dist/css/fabric.css';

const suggestionProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Suggested People',
  mostRecentlyUsedHeaderText: 'Suggested Contacts',
  noResultsFoundText: 'No results found',
  loadingText: 'Loading',
  showRemoveButtons: true,
  suggestionsAvailableAlertText: 'People Picker Suggestions available',
  suggestionsContainerAriaLabel: 'Suggested contacts',
};

const checkboxStyles = {
  root: {
    marginTop: 10,
  },
};
export interface IPeoplePickerProps {
  contextHttpClient: HttpClient;
  webAbsoluteURL: String;
  peoplePickerHandler: (value) => void;
  peopleListData: IPersonaPropsCustom;
  clearInput: boolean;
}

export interface IPersonaPropsCustom extends IPersonaProps{
  FirstName?: String;
  LastName?: String;
  WorkEmail?: String;
}

export interface IPeoplePickerState {
  delayResults?: boolean;
  isPickerDisabled: boolean;
  mostRecentlyUsed: IPersonaProps[];
  currentSelectedItems?: IPersonaProps[];
  selectedItems: IPersonaProps[];
  peopleList: IPersonaProps[];
}


//export const PeoplePickerNormal: React.FunctionComponent<IPeoplePickerProps> = (props) => {
  export class PeoplePickerNormal extends React.Component<IPeoplePickerProps, IPeoplePickerState> {
    public mru: IPersonaPropsCustom[]; // sample data
    public peopleList: IPersonaPropsCustom[] = [];
    public people: IPersonaPropsCustom[] = [];

    constructor(props:IPeoplePickerProps){
      super(props);



      if(Object.keys(props.peopleListData).length !== 0){
        //people = [props.peopleListData];
        this.people.push(props.peopleListData);
      }

      const selectedList: IPersonaProps[] = [];
      // people.forEach((persona: IPersonaProps) => {
      //   const target: IPersonaWithMenu = {};

      //   assign(target, persona);
      //   peopleList.push(target);
      // });

      this.state = {
        delayResults: false,
        peopleList: this.people,
        mostRecentlyUsed: this.mru,
        currentSelectedItems: [],
        selectedItems: selectedList,
        isPickerDisabled: false
      };
    }  // end of constructor

  // const picker = React.useRef(null);
  public _picker = React.createRef<IBasePicker<any>>();


  public componentWillReceiveProps(nextProps) {
    if(nextProps.clearInput){
      // let newSelectedItems = [...this._picker.current.items];
      // this.setState({ peopleList: newSelectedItems });
      this.setState({
        peopleList: [],
        selectedItems: []
      });
    }else{
      const tmpPeopleList = this.peopleList.slice(0, 1)[0];
      if(tmpPeopleList && (tmpPeopleList.FirstName != nextProps.peopleListData.FirstName ||
        tmpPeopleList.LastName != nextProps.peopleListData.LastName ||
        tmpPeopleList.WorkEmail != nextProps.peopleListData.WorkEmail ||
        tmpPeopleList.secondaryText != nextProps.peopleListData.secondaryText)
         ){
           const tmpList: IPersonaPropsCustom[] = [];
           if(Object.keys(this.props.peopleListData).length !== 0){
              //people = [props.peopleListData];
              tmpList.push(nextProps.peopleListData);
            }

            // this.peopleList.push(tmpList);
            this.peopleList = [...tmpList];
            this.setState({
              peopleList: tmpList,
              selectedItems: tmpList
            });

         }
    }
  }

  private _onChange = (items: IPersonaProps[]) => {
    this.setState({
      selectedItems: items
    });
  }

  public render(): React.ReactElement<IPeoplePickerProps> {
    return (

  <div>

    <div>
      <NormalPeoplePicker
        selectedItems = { this.state.selectedItems }
        onChange={this._onChange}
        onResolveSuggestions={this.onFilterChanged}
        getTextFromItem={ _getTextFromItem }
        pickerSuggestionsProps={suggestionProps}
        className={'ms-PeoplePicker'}
        defaultSelectedItems={ this.getDefaultSelections()}
        key={'normal'}
        onRemoveSuggestion={ this.onRemoveSuggestion }
        onValidateInput={validateInput}
        removeButtonAriaLabel={'Remove'}
        inputProps={{
          // onBlur: (ev: React.FocusEvent<HTMLInputElement>) => console.log('onBlur called'),
          // onFocus: (ev: React.FocusEvent<HTMLInputElement>) => console.log('onFocus called'),
          'aria-label': 'People Picker',
        }}
       // ref={ picker }
        // componentRef={this._picker}
        componentRef={this._picker}
        onInputChange={onInputChange}
        resolveDelay={200}
        itemLimit={1}
        disabled={ this.state.isPickerDisabled }
      />
    </div>
    <div>
        {this.state.selectedItems.map((person) => { return (
            <p>{person.text}</p>
        );
      }
      )}
    </div>
  </div>
        );
      }

  private searchPeople = (terms: string): IPersonaPropsCustom[] | Promise<IPersonaPropsCustom[]> => {

    return new Promise<IPersonaPropsCustom[]>((resolve, reject) =>
      this.props.contextHttpClient.get(`${this.props.webAbsoluteURL}/_api/search/query?querytext='*${terms}*'&rowlimit=10&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'`,
      HttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': ''
          }
        }).then((response: SPHttpClientResponse): Promise<{ PrimaryQueryResult: any }> => {
          return response.json();
        }).then((response: { PrimaryQueryResult: any }): void => {
          let relevantResults: any = response.PrimaryQueryResult.RelevantResults;
          let resultCount: number = relevantResults.TotalRows;
          this.peopleList = [];
          if (resultCount > 0) {
            relevantResults.Table.Rows.forEach( row =>  {
              let persona: IPersonaPropsCustom = {};
              row.Cells.forEach(cell=> {
                if (cell.Key === 'JobTitle')
                  persona.secondaryText = cell.Value;
                if (cell.Key === 'PictureURL')
                  persona.imageUrl = cell.Value;
                if (cell.Key === 'WorkEmail')
                  persona.WorkEmail = cell.Value;
                if (cell.Key === 'PreferredName'){
                  persona.primaryText = cell.Value;
                  try{
                    const flName = cell.Value.split(' ');
                    persona.FirstName = flName[0];
                    persona.LastName = flName[1];
                  }catch(ex){
                    console.log('Error from searchPeople');
                    console.log(ex);
                  }
                }

              });
              this.peopleList.push(persona);
            });
          }
          resolve(this.peopleList);
        }, (error: any): void => {
          reject();
        }));
  } // end of searchPeople

  // (filterText: string): IPersonaPropsCustom[]
  private filterPersonasByText =  async (filterText: string) : Promise<IPersonaPropsCustom[]> => {
    if(filterText && filterText.length < 2){
      return;
    }
    const apiResponse: any = await this.searchPeople(filterText);
     // setPeopleList(apiResponse); 
    // peopleList = [...apiResponse ]; 
     //return peopleList.filter(item => doesTextStartWith(item.text as string, filterText));
     if(this.peopleList == undefined || this.peopleList.length <= 0){
       return;
     }
     return this.peopleList.filter(item => doesTextStartWith(item.primaryText as string, filterText));
  }


  private filterPromise = (personasToReturn: IPersonaPropsCustom[]): IPersonaPropsCustom[] | Promise<IPersonaPropsCustom[]> => {
    if (this.state.delayResults) {
      return convertResultsToPromise(personasToReturn);
    } else {
      return personasToReturn;
    }
  }

  //When Item is selected from picker options
  // filterText is empty and currentPersonas will hold same number of records.

  private  onFilterChanged = async (
    filterText: string,
    currentPersonas: IPersonaPropsCustom[],
    limitResults?: number,
  ): Promise<IPersonaPropsCustom[]> => { // IPersonaPropsCustom[] | Promise<IPersonaPropsCustom[]>
    // selection made
    if(filterText === '' && currentPersonas.length === 1){
      this.props.peoplePickerHandler(currentPersonas);
    }
    if (filterText && filterText.length >= 2) {
      let filteredPersonas:IPersonaPropsCustom[] = await this.filterPersonasByText(filterText);

      if(filteredPersonas == undefined){
        return [];
      }else{
        filteredPersonas =  removeDuplicates(filteredPersonas, currentPersonas);
        filteredPersonas = limitResults ? filteredPersonas.slice(0, limitResults) : filteredPersonas;
        return this.filterPromise(filteredPersonas);
      }
    } else {
      return [];
    }
  }


  private returnMostRecentlyUsed = (currentPersonas: IPersonaPropsCustom[]): IPersonaPropsCustom[] | Promise<IPersonaPropsCustom[]> => {
    // this.state.setMostRecentlyUsed(removeDuplicates(this.state.mostRecentlyUsed, currentPersonas));
    return this.filterPromise(this.state.mostRecentlyUsed);
  }

  private onRemoveSuggestion = (item: IPersonaPropsCustom): void => {
    const indexPeopleList: number = this.peopleList.indexOf(item);
    const indexMostRecentlyUsed: number = this.state.mostRecentlyUsed.indexOf(item);

    if (indexPeopleList >= 0) {
      const newPeople: IPersonaPropsCustom[] = this.peopleList
        .slice(0, indexPeopleList)
        .concat(this.peopleList.slice(indexPeopleList + 1));
     // setPeopleList(newPeople); 
      // peopleList = [...newPeople];
    }

    if (indexMostRecentlyUsed >= 0) {
      const newSuggestedPeople: IPersonaPropsCustom[] = this.state.mostRecentlyUsed
        .slice(0, indexMostRecentlyUsed)
        .concat(this.state.mostRecentlyUsed.slice(indexMostRecentlyUsed + 1));
      // setMostRecentlyUsed(newSuggestedPeople);
    }
  }

  private getDefaultSelections = () => {
    //peopleList.slice(0, 1)
    return this.peopleList.slice(0, 1);
  }


}

function doesTextStartWith(text: string, filterText: string): boolean {
  return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
}

function removeDuplicates(personas: IPersonaPropsCustom[], possibleDupes: IPersonaPropsCustom[]) {
  return personas.filter(persona => !listContainsPersona(persona, possibleDupes));
}

function listContainsPersona(persona: IPersonaPropsCustom, personas: IPersonaPropsCustom[]) {
  if (!personas || !personas.length || personas.length === 0) {
    return false;
  }
  return personas.filter(item => item.primaryText === persona.primaryText).length > 0;
}

function convertResultsToPromise(results: IPersonaPropsCustom[]): Promise<IPersonaPropsCustom[]> {
  return new Promise<IPersonaPropsCustom[]>((resolve, reject) => setTimeout(() => resolve(results), 2000));
}

function _getTextFromItem(persona: IPersonaPropsCustom): string {
  // console.log(persona);
  return persona.primaryText as string;
}

function validateInput(input: string): ValidationState {
  {
    return ValidationState.invalid;
  }
}

/**
 * Takes in the picker input and modifies it in whichever way
 * the caller wants, i.e. parsing entries copied from Outlook (sample
 * input: "Aaron Reid <aaron>").
 *
 * @param input The text entered into the picker.
 */
function onInputChange(input: string): string {
  if(input && input.length >= 2){
    const outlookRegEx = /<.*>/g;
    const emailAddress = outlookRegEx.exec(input);

    if (emailAddress && emailAddress[0]) {
      return emailAddress[0].substring(1, emailAddress[0].length - 1);
    }

  }

  return input;
}
