import React, { useEffect, useState } from "react";
import { BsPencilFill, BsPaletteFill } from "react-icons/bs";
import { EntryTemplate } from "../../types";

/**
 * Configuration object to specify additional, game-specific binary attributes of an entry.
 * The specified icon will be displayed alongside the default binary attributes
 * `signed` and `altered`, if the value of the entry, that is retrieved by using
 * the access key of this configuration object is `true`.
 */
type ExtraAttribute = {
  accessKey: string;
  icon?: React.FC|JSX.Element
}

/**
 * Template panel to display the details on of an entry.
 * The panel needs to be connected with a image display modal via three functions
 * that control this image modal.
 * 
 * # Props:
 * * entry                    - entry object that contains the data that should be displayed.
 * * defaultImageUrl          - Url to the default image that should be displayed as a preview image of the entry 
 * * extraAttributes          - List of additional binary attributes beyond the standard binary attributes `signed` and `altered`
 * * fetchEntryPreviewImage   - Function to fetch the specific preview image for the entry object specified by property `entry`.
 * * setImageModalImages      - Function to pass a list of image names to the connected image modal.
 * * setImageModalImageIndex  - Function to set the starting image index of the connected image modal.
 * * setImageModalVisible     - Function to control the visiblity of the connected image modal. 
 **/
const EntryPanelTemplate: React.FC<{
  entry: EntryTemplate;
  defaultImageUrl: string;
  extraAttributes: ExtraAttribute[];
  fetchEntryPreviewImage: Function;
  setImageModalImages: Function;
  setImageModalImageIndex: Function;
  setImageModalVisible: Function;
}> = (props) => {

  // preview image of the card entry, default image or value that is fetched via `props.fetchEntryPreviewImage`.
  const [previewImage, setPreviewImage] = useState<string>(""); 

  // if entry reference changes, the preview image of the corresponding
  // card gets fetched. If no image could be found, the default image will be displayed.
  useEffect(() => {
    if (props.entry) {
      props.fetchEntryPreviewImage(props.entry)
      .then((result: string) => setPreviewImage(result));
    }
    else {
      // in this case the current selected entry was deleted. Therefore, we also reset the preview image
      setPreviewImage("");
    }
  }, [props.entry]);

  // trigger the connected image modal to display the image with the specfied index from
  // the list of images of the currently selected entry.
  const displayImage = async (index: number) => {
    props.setImageModalImages(props.entry.images);
    props.setImageModalImageIndex(index);
    props.setImageModalVisible(true);
  };

  return (
    <>
      <div className="fixed mt-4 z-[1]">
        <div>
          {previewImage && previewImage != ""
          ? <img src={previewImage} width={250} />
          : <img src={props.defaultImageUrl} width={250} />
          }
        </div>
        {props.entry ? (
          <div className="grid grid-settings-2 gap-x-4 gap-y-2 mt-4">
            <p>Name</p>
            <p>{props.entry.name}</p>
            <p>Set</p>
            <p>{props.entry.set.name}</p>
            {props.entry.setNo && props.entry.setNo != ""
              ? <>
              <p>Set No.</p>
              <p>{props.entry.set.id.toUpperCase()}-{props.entry.setNo}</p>
              </>
              : ""
            }
            <p>Language</p>
            <p>{props.entry.language}</p>
            <p>Condition</p>
            <p>{props.entry.condition}</p>
            <p>Amount</p>
            <p>{props.entry.amount}</p>
            <p></p>
            <div className="flex">
              {props.extraAttributes.map(attribute => 
                props.entry[attribute.accessKey] ? <>{attribute.icon}<div className="mr-2"></div></> : ""
              )}
              {props.entry.signed ? <BsPencilFill className="mr-2" /> : ""}
              {props.entry.altered ? <BsPaletteFill className="mr-2" /> : ""}
            </div>

            <p className="mt-4">Note</p>
            <p className="mt-4">{props.entry.note}</p>

            <p>Images</p>
            <div>
              {props.entry.images.map((value, index) => (
                <div
                  className="hover:bg-blue-50 cursor-pointer"
                  id={index.toString()}
                  onClick={() => displayImage(index)}
                >
                  Image {index+1}
                </div>
              ))}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default EntryPanelTemplate;
