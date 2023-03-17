import React, { Suspense } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Image from "next/image";

import SpinnerLoader from "./SpinnerLoader";

// Promise wrapper that acts as an interface for a component to work with React.Suspense.
const wrapPromise = <T,>(promise: Promise<T>) => {
  let status = 'pending'; // set initial status
  let result: T;
  let error: any;

  // resolve promise
  let suspender = promise.then(
    (res) => {
      status = 'success';
      result = res;
    },
    (err) => {
      status = 'error';
      error = err;
    }
  );

  return {
    read() {
      switch (status) {
        case 'pending': throw suspender;
        case 'error': throw error;
        default: return result;
      }
    }
  };
};

// Get the promise that returns the image data as base-64 string once it resolves.
const loadImagePromise = (images: string[], index: number, game: string) => {
    return invoke("get_image_b64", { image: images[index], game: game})
    .then(res => res as string)
    .catch(err => err)
  }

  // wrap image data promise inside the "Suspense interface"
const loadImageWrapped = (images: string[], index: number, game: string) => {
  const imagePromise = loadImagePromise(images, index, game);
  return wrapPromise(imagePromise);
};

// Image component that can be used with React.Suspense 
const CardImageSuspendable: React.FC<{ resource: any }> = (props) => {
  const imageB64: string = props.resource.read();
  return (
    <Image src={imageB64} layout="fill" objectFit="contain" />
  )
};

/**
 * This component loads an image from the backend and displays it. It uses React.Suspense in order
 * to display a loading animation until the image data is loaded.
 * 
 * # Props:
 * * game       - Name of the game for which images should be displayed.
 * * images     - List of image names. From this list, one image is loaded and displayed at a time.
 * * index      - index that indicates which element from `props.images` should be displayed. 
 */
const CardImageWithLoader: React.FC<{images: string[], index: number, game: string}> = (props) => {

  return (
      <Suspense fallback={<SpinnerLoader/>}>
        <CardImageSuspendable resource={loadImageWrapped(props.images, props.index, props.game)} />
      </Suspense>
  );
};

export default CardImageWithLoader;
