import React, { Dispatch, SetStateAction } from "react";
import { CardEntry } from "../../types/magic";
import { TableTemplate } from "../templates";

import { IoSparklesSharp } from "react-icons/io5";
import { BsPencilFill, BsPaletteFill } from "react-icons/bs";

/**
 * Table to display a collection of Magic cards and select entries from it.
 * 
 * # Props:
 * * collection       - List of `CardEntry` objects that should be displayed via the table.
 * * selectedEntry    - `CardEntry` object that is currently selected by the user.
 * * setCollection    - Function to set/update the collection list that should be displayed.
 * * setSelectedEntry - Function to specifiy, which entry from the table the user has currenty selected.
 */
const MtgTable: React.FC<{
  collection: CardEntry[];
  selectedEntry: CardEntry;
  setCollection: Dispatch<SetStateAction<CardEntry[]>>;
  setSelectedEntry: Dispatch<SetStateAction<CardEntry>>;
}> = (props) => {

    const tableFields = [
        {label: "Name", valueKey: "name", sortKey: "name"},
        {label: "Set", valueKey: "set.name", sortKey: "set.releaseDate"},
        {label: "Language", valueKey: "language", sortKey: "language"},
        {label: "Condition", valueKey: "condition", sortKey: "condition"},
        {label: "#", valueKey: "amount", sortKey: "amount"},
        {label: "Foil", valueKey: "foil", sortKey: "foil", icon: <IoSparklesSharp /> },
        {label: "Signed", valueKey: "signed", sortKey: "signed", icon: <BsPencilFill /> },
        {label: "Altered", valueKey: "altered", sortKey: "altered", icon: <BsPaletteFill /> },
        {label: "Note", valueKey: "note", sortKey: "note"}
      ];
    
      return (
        <TableTemplate
        tableFields={tableFields}
        collection={props.collection}
        selectedEntry={props.selectedEntry}
        setCollection={props.setCollection}
        setSelectedEntry={props.setSelectedEntry}
        />
      );
};

export default MtgTable;
