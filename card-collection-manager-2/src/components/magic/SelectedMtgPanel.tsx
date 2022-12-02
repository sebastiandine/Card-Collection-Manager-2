import React, { Dispatch, SetStateAction } from "react";
import { CardEntry } from "../../types/magic";
import { IoSparklesSharp } from "react-icons/io5";
import { EntryPanelTemplate } from "../templates";

/**
 * Function to query the card image from the Scryfall API for the specfied
 * card entry. In case a matching record could be found, the url to the image will
 * be returned, otherwise an empty string will be returned.
 */
 const getImage = async (entry: CardEntry) => {

  // preparing card name to be compatible with the API
  const escapedName = entry.name.replace("&", "and");

  const requestUrl = `https://api.scryfall.com/cards/search?q=name:"${escapedName}" AND set:${entry.set.id}`;
  const resp: Response = await fetch(requestUrl);
  const json = await resp.json();
  if (json.data && json.data.length > 0) {
    const obj = json.data[0];
    return obj.image_uris.normal;
  }
  return "";
};

/**
 * Panel to display the details on a selected Magic card entry.
 * The panel needs to be connected via a image display modal via three functions
 * that control this image modal.
 * 
 * # Props:
 * * entry                    - `CardEntry` object that contains the data that should be displayed.
 * * setImageModalImages      - Function to pass a list of image names to the connected image modal.
 * * setImageModalImageIndex  - Function to set the starting image index of the connected image modal.
 * * setImageModalVisible     - Function to control the visiblity of the connected image modal. 
 **/
const SelectedMtgPanel: React.FC<{
  entry: CardEntry;
  setImageModalImages: Dispatch<SetStateAction<string[]>>;
  setImageModalImageIndex: Dispatch<SetStateAction<number>>;
  setImageModalVisible: Dispatch<SetStateAction<boolean>>;
}> = (props) => {

  const extraAttributes = [
    {accessKey: "foil", icon: <IoSparklesSharp />},
  ]

  return (
    <EntryPanelTemplate
      entry={props.entry}
      defaultImageUrl="https://gamepedia.cursecdn.com/mtgsalvation_gamepedia/f/f8/Magic_card_back.jpg"
      extraAttributes={extraAttributes}
      fetchEntryPreviewImage={getImage}
      setImageModalImages={props.setImageModalImages}
      setImageModalImageIndex={props.setImageModalImageIndex}
      setImageModalVisible={props.setImageModalVisible}
    />
  );
};

export default SelectedMtgPanel;
