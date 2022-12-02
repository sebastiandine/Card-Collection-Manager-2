import React, { Dispatch, SetStateAction } from "react";

import { CardEntry } from "../../types/magic";
import { CreateEditModalTemplate } from "../templates";

// Enum to control wether the modal is in "Create" or "Edit" mode.
export enum Mode {
  Create,
  Edit,
}

/**
 * Modal to create a new Magic card entry or edit an existing one.
 * The modal needs to be connected via a image display modal via three functions
 * that control this image modal.
 *
 * # Props:
 * * visible                  - Flag to indicate wheter the modal should be displayed or not.
 * * setVisible               - Function to change the value of prop `visible`.
 *
 * * mode                     - Flag to specifiy if the modal should be in "Create new Entry" or "Edit existing Entry" node.
 *
 * * collection               - Reference to the current Magic `CardEntry` collection.
 * * setCollection            - Function to set/update the collection list  to add new entries or update existing ones.
 *
 * * selectedEntry            - Reference to the currently selected `CardEntry` entry that should be edited in case the modal is in `Edit` mode.
 * * setSelectedEntry         - Function to set/update the currently selected `CardEntry` entry.
 *
 * * setImageModalImages      - Function to pass a list of image names to the connected image modal.
 * * setImageModalImageIndex  - Function to set the starting image index of the connected image modal.
 * * setImageModalVisible     - Function to control the visiblity of the connected image modal.
 */
const CreateEditMtgModal: React.FC<{
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  collection: CardEntry[];
  mode: Mode;
  selectedEntry: CardEntry;
  setCollection: Dispatch<SetStateAction<CardEntry[]>>;
  setSelectedEntry: Dispatch<SetStateAction<CardEntry>>;
  setImageModalImages: Dispatch<SetStateAction<string[]>>;
  setImageModalImageIndex: Dispatch<SetStateAction<number>>;
  setImageModalVisible: Dispatch<SetStateAction<boolean>>;
}> = (props) => {
  const extraAttributes = [{ label: "Foil", accessKey: "foil" }];

  return (
    <CreateEditModalTemplate
      visible={props.visible}
      setVisible={props.setVisible}
      game="Magic"
      extraAttributes={extraAttributes}
      selectedEntry={props.selectedEntry}
      setSelectedEntry={props.setSelectedEntry}
      mode={props.mode}
      collection={props.collection}
      setCollection={props.setCollection}
      setImageModalImages={props.setImageModalImages}
      setImageModalImageIndex={props.setImageModalImageIndex}
      setImageModalVisible={props.setImageModalVisible}
    />
  );
};

export default CreateEditMtgModal;
