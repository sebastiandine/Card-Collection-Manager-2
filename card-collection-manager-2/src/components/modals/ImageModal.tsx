import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { GrNext, GrPrevious } from "react-icons/gr";

import ModalTemplate from "../templates/ModalTemplate";
import CardImageWithLoader from "../templates/CardImageWithLoader";

/**
 * Modal to display a set of images.
 * 
 * # Props:
 * * visible    - Flag to indicate wheter the modal should be displayed or not.
 * * setVisible - Function to change the value of prop `visible`.
 * * game       - Name of the game for which images should be displayed.
 * * images     - List of image names that should be displayed (only name, no paths).
 * * startIndex - (Optional) index that indicates at which element of the list provided via `props.images` the display should start.
 */
const ImageModal: React.FC<{
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  game: string;
  images: string[];
  startIndex?: number;
}> = (props) => {

  // index of current image in `props.images`
  const [imageIndex, setImageIndex] = useState<number>(0);

  useEffect(() => {
    if (props.visible && props.images) {
      setImageIndex(props.startIndex | 0);
    }
  }, [props.visible]);

  const loadNextImage = () => {
    if(imageIndex < props.images.length -1){
      setImageIndex(imageIndex + 1);
    }
  }

  const loadPreviousImage = () => {
    if(imageIndex > 0){
      setImageIndex(imageIndex - 1);
    }
  }

  return (
    <>
      {props.visible ? (
        <ModalTemplate
          title="Image"
          onClickCloseIcon={() => props.setVisible(false)}
          modalStyle=" w-[80%] h-[80%]"
        >
          <div className="relative h-[90%] mx-8">
            <CardImageWithLoader images={props.images} index={imageIndex} game={props.game} />
          
            {/* next/previous image icons */}
            {props.images.length > 1 ? (
              <div className="absolute flex justify-between z-20 top-[50%] w-full">
                {imageIndex > 0 ? (
                  <div className="ml-4 hover:scale-110 hover:rounded-full hover:shadow-xl shadow-gray-500 cursor-pointer" onClick={() => loadPreviousImage()}>
                    <GrPrevious className="test-gray-600" />
                  </div>
                ) : (
                  <div></div>
                )}
                {imageIndex < props.images.length - 1 ? (
                  <div className="mr-4 hover:scale-110 hover:rounded-full hover:shadow-xl shadow-gray-500 cursor-pointer" onClick={() => loadNextImage()}>
                    <GrNext className="test-gray-600" />
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            ) : (
              ""
            )}
          </div>
        </ModalTemplate>
      ) : (
        ""
      )}
    </>
  );
};

export default ImageModal;
