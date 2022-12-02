import React, { Dispatch, SetStateAction } from "react";
import { CardEntry } from "../../types/pokemon";
import IconPokemonFirstEdition from "./IconPokemonFirstEdition";
import { IoSparklesSharp } from "react-icons/io5";
import { EntryPanelTemplate } from "../templates";

/**
 * Function to query the card image from the Pokemon TCG API for the specfied
 * card entry. In case a matching record could be found, the url to the image will
 * be returned, otherwise an empty string will be returned.
 */
const getImage = async (entry: CardEntry) => {

  // preparing card name to be compatible with the API
  const escapedName = entry.name
    .replace("&", "*")
    .replace(" EX", "-EX")
    .replace(" GX", "-GX");

  // if the set number of the entry is maintainend, we will query via set-id + set-no.
  // This is especially helpfull when there are multiple artworks of the same card in the 
  // same set.
  const reqViaId = `https://api.pokemontcg.io/v2/cards?q=id:"${entry.set.id}-${entry.setNo}"`;

  // if set number is not maintainend, we will query via card name + set-id.
  const reqViaNameAndSet = `https://api.pokemontcg.io/v2/cards?q=name:"${escapedName}" AND set.id:${entry.set.id}`;

  const resp: Response = await fetch(entry.setNo && entry.setNo != "" ? reqViaId : reqViaNameAndSet);
  const json = await resp.json();
  if (json.data && json.data.length > 0) {
    const obj = json.data[0];
    return obj.images.small;
  }
  return "";
};

/**
 * Panel to display the details of a selected Pokemon card entry.
 * The panel needs to be connected via a image display modal via three functions
 * that control this image modal.
 *
 * # Props:
 * * entry                    - `CardEntry` object that contains the data that should be displayed.
 * * setImageModalImages      - Function to pass a list of image names to the connected image modal.
 * * setImageModalImageIndex  - Function to set the starting image index of the connected image modal.
 * * setImageModalVisible     - Function to control the visiblity of the connected image modal.
 **/
const SelectedPokemonPanel: React.FC<{
  entry: CardEntry;
  setImageModalImages: Dispatch<SetStateAction<string[]>>;
  setImageModalImageIndex: Dispatch<SetStateAction<number>>;
  setImageModalVisible: Dispatch<SetStateAction<boolean>>;
}> = (props) => {

  const extraAttributes = [
    {accessKey: "holo", icon: <IoSparklesSharp />},
    {accessKey: "firstEdition", icon: <IconPokemonFirstEdition />},
  ]

  return (
    <EntryPanelTemplate
      entry={props.entry}
      defaultImageUrl="https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg"
      extraAttributes={extraAttributes}
      fetchEntryPreviewImage={getImage}
      setImageModalImages={props.setImageModalImages}
      setImageModalImageIndex={props.setImageModalImageIndex}
      setImageModalVisible={props.setImageModalVisible}
    />
  );
};

export default SelectedPokemonPanel;
