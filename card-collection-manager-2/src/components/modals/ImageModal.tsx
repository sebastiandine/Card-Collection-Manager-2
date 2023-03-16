import React, { Dispatch, SetStateAction, useEffect, useState, Suspense } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { GrNext, GrPrevious } from "react-icons/gr";
import { RotatingLines } from "react-loader-spinner";

import ModalTemplate from "../templates/ModalTemplate";
import Image from "next/image";

const wrapPromise = (promise: Promise<any>) => {
  // set initial status
  let status = "pending";
  // result
  let result: any;
  // wait for promise
  let suspender = promise.then(
    res => {
      status = "success";
      result = res;
    },
    err => {
      status = "error";
      result = err;
    }
  );

  return {
    read() {
      console.log(`Status: ${status}`);
      if(status === "pending") {
        throw suspender;
      }
      else if(status === "error") {
        throw result;
      }
      else if(status === "success") {
        return result;
      }
    }
  }
}

const loadImagePromise = (images: string[], index: number, game: string) => {
  return invoke("get_image_b64", { image: images[index], game: game})
  .then(res => res as string)
  .catch(err => err)
}

const loadImage = (images: string[], index: number, game: string) => {
  const imagePromise = loadImagePromise(images, index, game);
  return wrapPromise(imagePromise);
}

const CardImage: React.FC<{images: string[], index: number, game: string}> = (props) => {
  const imageB64 = loadImage(props.images, props.index, props.game).read();
  return (
    <Image src={imageB64 as string} layout="fill" objectFit="contain" />
  )
}

const Loader: React.FC<{}> = () => {
  return (
    <div className="w-full h-[90%] flex items-center justify-center">
      <RotatingLines
        strokeColor="grey"
        strokeWidth="5"
        animationDuration="0.75"
        width="96"
      />
  </div>  
  )
}

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

  // current image as base-64 string
  const [imageB64, setImageB64] = useState<string>("");
  // index of current image in `props.images`
  const [imageIndex, setImageIndex] = useState<number>(0);
  // flag to display the loading image
  const [loaderVisible, setLoaderVisible] = useState<boolean>(false); // true

  useEffect(() => {
    if (props.visible && props.images) {
      //setLoaderVisible(true);
      setImageIndex(props.startIndex | 0);
      //loadImage(props.startIndex | 0);
    }
  }, [props.visible]);

  const loadImage = async (id: number) => {
    invoke("get_image_b64", { image: props.images[id], game: props.game }).then(
      (result) => {
        setImageB64(result as string);
        setLoaderVisible(false);
      }
    );
  };

  const loadNextImage = () => {
    if(imageIndex < props.images.length -1){
      setLoaderVisible(true);
      setImageIndex(imageIndex + 1);
      loadImage(imageIndex + 1);
    }
  }

  const loadPreviousImage = () => {
    if(imageIndex > 0){
      setLoaderVisible(true);
      setImageIndex(imageIndex - 1);
      loadImage(imageIndex - 1);
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
            <Suspense fallback={<Loader />} >
              <CardImage images={props.images} index={imageIndex} game={props.game} />
            </Suspense>

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
