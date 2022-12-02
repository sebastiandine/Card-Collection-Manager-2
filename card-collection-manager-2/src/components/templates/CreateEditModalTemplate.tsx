import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

import ModalTemplate from "../templates/ModalTemplate";

import { SetTemplate, EntryTemplate } from "../../types";

import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import { VscClose } from "react-icons/vsc";

import IntegerInput from "../templates/IntegerInput";
import ConfirmationModal from "../modals/ConfirmationModal";

// Enum to control wether the modal is in "Create" or "Edit" mode.
export enum Mode {
  Create,
  Edit,
}

/**
 * Configuration object to specify additional, game-specific binary attributes of an entry.
 * The specified label will be displayed for a corresponding checkbox that represents
 * this attribute. The accessKey is used to retrieve the current value of the attribute
 * for an entry that is editied as well as to send a new/updated value of the attribute
 * to the backend.
 */
type ExtraAttribute = {
  label: string;
  accessKey: string;
}

/**
 * Template modal to create a new collection entries or edit existing ones.
 * The modal needs to be connected via a image display modal via three functions
 * that control this image modal.
 *
 * # Props:
 * * visible                  - Flag to indicate wheter the modal should be displayed or not.
 * * setVisible               - Function to change the value of prop `visible`.
 * 
 * * game                     - Identifier of the game for which this modal should create or edit entries. 
 *                              This is required to identify the correct collection and corresponding file system
 *                              directories.
 * 
 * * extraAttributes          - List of additional, games-specific binary attributes beyond the standard binary 
 *                              attributes `signed` and `altered`
 *
 * * mode                     - Flag to specifiy if the modal should be in "Create new Entry" or "Edit existing Entry" node.
 *
 * * collection               - Reference to the current entry collection.
 * * setCollection            - Function to set/update the collection list  to add new entries or update existing ones.
 *
 * * selectedEntry            - Reference to the currently selected entry that should be edited in case the modal is in `Edit` mode.
 * * setSelectedEntry         - Function to set/update the currently selected entry.
 *
 * * setImageModalImages      - Function to pass a list of image names to the connected image modal.
 * * setImageModalImageIndex  - Function to set the starting image index of the connected image modal.
 * * setImageModalVisible     - Function to control the visiblity of the connected image modal.
 */
const CreateEditModalTemplate: React.FC<{
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  game: string;
  extraAttributes: ExtraAttribute[]
  collection: EntryTemplate[];
  mode: Mode;
  selectedEntry: EntryTemplate;
  setCollection: Dispatch<SetStateAction<EntryTemplate[]>>;
  setSelectedEntry: Dispatch<SetStateAction<EntryTemplate>>;
  setImageModalImages: Dispatch<SetStateAction<string[]>>;
  setImageModalImageIndex: Dispatch<SetStateAction<number>>;
  setImageModalVisible: Dispatch<SetStateAction<boolean>>;
}> = (props) => {
  const [sets, setSets] = useState<SetTemplate[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);

  // confirmation modal visibilities
  const [abortConfirmationModalVisibility, setAbortConfirmationModalVisiblity] = useState<boolean>(false);


  // form input element refs
  const nameRef = useRef<HTMLInputElement>(null);
  const setRef = useRef<HTMLSelectElement>(null);
  const setNoRef = useRef<HTMLInputElement>(null);
  const languageRef = useRef<HTMLSelectElement>(null);
  const conditionRef = useRef<HTMLSelectElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const signedRef = useRef<HTMLInputElement>(null);
  const alteredRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);
  // dynamic creation of refs for extra attributes
  let extraAttributesRefs = {};
  props.extraAttributes.map(attribute => extraAttributesRefs[attribute.accessKey] = useRef<HTMLInputElement>(null));

  // images as state variable for better handling
  const [images, setImages] = useState<string[]>([]);

  // The first time this modal gets rendered, it fetches language and condition
  // informations from the backened.
  useEffect(() => {
    invoke("get_language_variants_json").then((result) => {
      const obj = JSON.parse(result as string) as string[];
      setLanguages(obj);
    });

    invoke("get_condition_variants_json").then((result) => {
      const obj = JSON.parse(result as string) as string[];
      setConditions(obj);
    });
  }, []);

  // everytime the modal becomes visible in "Edit" mode, it populates
  // its fields with the data from the selected entry.
  useEffect(() => {
    if (props.visible) {

      // get set data. We need to do this each time the element
      // becomes visible, because the user might have updated the set
      // data in between.
      invoke("get_sets", {game: props.game}).then((result) => {
        const obj = JSON.parse(result as string) as SetTemplate[];
        setSets(obj);
      });

      // populate fields with data in case of 'edit' mode
      if (props.mode == Mode.Edit) {
        nameRef.current!.value = props.selectedEntry.name;
        setRef.current!.value = props.selectedEntry.set.id.toLowerCase();
        setNoRef.current!.value = props.selectedEntry.setNo;
        languageRef.current!.value = props.selectedEntry.language;
        conditionRef.current!.value = props.selectedEntry.condition;
        amountRef.current!.value = `${props.selectedEntry.amount}`;
        noteRef.current!.value = props.selectedEntry.note;
        signedRef.current!.checked = props.selectedEntry.signed;
        alteredRef.current!.checked = props.selectedEntry.altered;
        // populate dynamic extra attribute fields 
        props.extraAttributes.map(attribute => extraAttributesRefs[attribute.accessKey].current!.checked = props.selectedEntry[attribute.accessKey]);

        setImages(props.selectedEntry.images);
      }
    } else {
      // clear image state in any case the modal gets closed
      setImages([]);
    }
  }, [props.visible]);

  // handler when user aborts maintaining an entry by clicking the close icon
  const onClose = () => {
    // if "Create" mode, delete all temporary stored images
    if (props.mode == Mode.Create) {
      images.forEach((image) => {
        invoke("delete_image", { image: image, game: props.game });
      });
    }
    // if "Edit" mode, delete all newly added images
    if (props.mode == Mode.Edit) {
      images
        .filter((image) => !props.selectedEntry.images.includes(image))
        .forEach((image) => {
          invoke("delete_image", { image: image, game: props.game });
        });
    }
    props.setVisible(false);
  };

  // get temporary entry from the current values stored in all input fields
  const getTempEntry = () => {
    let cardEntry: EntryTemplate = {
      id: props.mode == Mode.Create ? 0 : props.selectedEntry.id,
      name: nameRef.current!.value,
      set: sets.filter((set) => set.id === setRef.current!.value)[0],
      setNo: setNoRef.current!.value,
      language: languageRef.current!.value,
      condition: conditionRef.current!.value,
      amount: Number.parseInt(amountRef.current!.value),
      altered: alteredRef.current!.checked,
      signed: signedRef.current!.checked,
      note: noteRef.current!.value,
      images: images,
    };
    // get values of extra attributes
    props.extraAttributes.map(attribute => cardEntry[attribute.accessKey] = extraAttributesRefs[attribute.accessKey].current!.checked);
    return cardEntry;
  };

  // submit an entry to the backend based on the current values of all input fields.
  // if "Edit" mode, the existing entry will be overwritten.
  const submitEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let cardEntry = getTempEntry();

    if (props.mode == Mode.Create) {
      invoke("add_card", { obj: JSON.stringify(cardEntry), game: props.game })
        .then((result) => {
          cardEntry.id = Number.parseInt(JSON.parse(result as string));
          props.setCollection(props.collection.concat(cardEntry));
          props.setVisible(false);
        })
        .catch((reject) => console.log(reject));
    }

    if (props.mode == Mode.Edit) {
      cardEntry.id = props.selectedEntry.id;
      invoke("update_card", { obj: JSON.stringify(cardEntry), game: props.game })
        .then(() => {
          props.setCollection(
            props.collection.map((entry) =>
              entry.id == cardEntry.id ? cardEntry : entry
            )
          );
          props.setSelectedEntry(cardEntry);
          props.setVisible(false);
        })
        .catch((reject) => console.log(reject));
    }
  };

  // trigger the image selection dialog, copy the selected image via the backend service and
  // store the returned image name in the temporary list of image names.
  const addImage = async () => {
    // only add image if name field has a value
    if (nameRef.current && nameRef.current.reportValidity()) {
      const selected = await open({
        multiple: true,
        title: "Select image",
        filters: [
          {
            name: "Image",
            extensions: ["png", "PNG", "jpg", "JPG", "jpeg", "JPEG"],
          },
        ],
      });
      if (selected && Array.isArray(selected)) {
        let cardEntry = getTempEntry();
        for(let i = 0; i < selected.length; i++) {
          const imgId = await invoke("copy_image", {
                          obj: JSON.stringify(cardEntry),
                          imgLocation: selected[i],
                          newEntry: props.mode == Mode.Create,
                          game: props.game
                        });
          cardEntry.images.push(imgId as string);
        }
        setImages([].concat(cardEntry.images)); // using the concat with an empty array is a trick to trigger the rerender, otherwise the state does recognize to rerender

      }
    }
  };

  // Enable the connected image modal and start the display by the provided image index.
  const displayImage = async (index: number) => {
    props.setImageModalImages(images);
    props.setImageModalImageIndex(index);
    props.setImageModalVisible(true);
  };

  // Delete the image with the specified image name by calling the corresponding backend service
  // and remove the image name from the temporary list.
  const deleteImage = async (image: string) => {
    invoke("delete_image", { image: image, game: props.game })
      .then(() => {
        setImages(images.filter((img) => img != image));
      })
      .catch((reject) => console.log(reject));
  };

  return (
    <>
      {props.visible ? (
        <ModalTemplate
          title={props.mode == Mode.Create ? "Create Entry" : "Edit Entry"}
          onClickCloseIcon={() => setAbortConfirmationModalVisiblity(true)}
          modalStyle="w-[60%] h-[70%] lg:w-[50%] xl:w-[35%] 2xl:w-[30%]"
        >
          <div className="relative flex justify-center items-center text-gray-600 mx-8">
            <form onSubmit={(e) => submitEntry(e)}>
              <div className="grid grid-settings-8 gap-x-4 gap-y-4">
                <label className="text-sm col-span-1">Name</label>
                <input
                  className="text-sm col-span-7 border-2"
                  type="text"
                  required={true}
                  autoFocus={true}
                  ref={nameRef}
                />

                <label className="text-sm col-span-1">Set</label>
                <select className="text-sm col-span-7 border-2" ref={setRef}>
                  {sets.map((set) => (
                    <option value={`${set.id}`}>{set.name}</option>
                  ))}
                </select>

                <label className="text-sm col-span-1">Set No.</label>
                <input type="number"
                  className="text-sm col-span-2 border-2"
                  defaultValue={""}
                  ref={setNoRef}
                />
                <div className="col-span-5" />

                <label className="text-sm col-span-1">Language</label>
                <select
                  className="text-sm col-span-3 border-2"
                  ref={languageRef}
                >
                  {languages.map((language) => (
                    <option value={language}>{language}</option>
                  ))}
                </select>
                <div className="col-span-4" />

                <label className="text-sm col-span-1">Condition</label>
                <select
                  className="text-sm col-span-3 border-2"
                  ref={conditionRef}
                >
                  {conditions.map((condition) => (
                    <option value={condition}>{condition}</option>
                  ))}
                </select>
                <div className="col-span-4" />

                <label className="text-sm col-span-1">Amount</label>
                <IntegerInput
                  className="text-sm col-span-2 border-2"
                  required={true}
                  ref={amountRef}
                />
                <div className="col-span-5" />

                <div className="text-sm col-span-1" />
                <div className="text-sm col-span-7 flex justify-between">
                  {/* fields for dynamic extra attributes */}
                  {props.extraAttributes.map(attribute =>
                    <div>
                      <input type="checkbox" ref={extraAttributesRefs[attribute.accessKey]} />
                      <label className="mx-2">{attribute.label}</label>
                    </div>
                   )}
                   {/* default attributes */}
                  <div>
                    <input type="checkbox" ref={signedRef} />
                    <label className="mx-2">Signed</label>
                  </div>
                  <div>
                    <input type="checkbox" ref={alteredRef} />
                    <label className="mx-2">Altered</label>
                  </div>
                </div>

                <label className="text-sm col-span-1">Note</label>
                <input
                  className="text-sm col-span-7 border-2"
                  type="text"
                  ref={noteRef}
                />

                <label className="text-sm col-span-1">Images</label>
                <div className="text-sm col-span-7">
                  {images.map((value, index) => (
                    <div className="flex items-center">
                      <div
                        className="hover:bg-blue-50 cursor-pointer"
                        id={index.toString()}
                        onClick={() => displayImage(index)}
                      >
                        Image {index + 1}
                      </div>
                      <div
                        className="mx-4 cursor-pointer hover:scale-125"
                        onClick={() => deleteImage(value)}
                      >
                        <VscClose className="text-red-600 text-lg" />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="my-4"
                    onClick={() => addImage()}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="my-4 text-center">
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </ModalTemplate>
      ) : (
        ""
      )}
      <ConfirmationModal
        visible={abortConfirmationModalVisibility}
        setVisible={setAbortConfirmationModalVisiblity}
        title={
          props.mode == Mode.Create
            ? "Abort Creating"
            : "Abort Editing"
        }
        text={
          props.mode == Mode.Create
            ? "Do you reall want to abort the current entry creation?"
            : "Do you really want to abort the current entry editing?"
        }
        confirmAction={() => onClose()}
      />
    </>
  );
};

export default CreateEditModalTemplate;
