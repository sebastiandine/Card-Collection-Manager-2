import React from "react";
import { AiOutlineClose } from "react-icons/ai";

/**
 * General template to implement modals. This template grays out the background and displays a 
 * centered container in which the modal specifics can be injected via prop `children`.
 * 
 * # Props:
 * * title              - Title of the modal, which will be displayed as the header of the modal container.
 * * children           - (Optional) React node containing the specific modal TSX.
 * * modalStyle         - (Optional) prop to extend/overwrite the styling of the modal container. If this prop is used,
 *                        it needs define at least the width and height of the modal container.
 * * onClickCloseIcon   - (Optional) callback function that should be invoked when the user clicks on the 'close'
 *                        icon on the top right corner of the modal container.
 * * onClickBackground  - (Optional) callback function that should be invoked when the user clicks on the grayed
 *                        out background.
 */
const ModalTemplate: React.FC<{
  title: string;
  children?: React.ReactNode;
  modalStyle?: string;
  onClickCloseIcon?: Function;
  onClickBackground?: Function;
}> = (props) => {
  return (
    <div className="absolute z-10 w-full h-full bg-black/70 flex justify-center items-center">
      <div className={`rounded-lg bg-white shadow-xl ${props.modalStyle ? props.modalStyle : "w-[50%] h-[50%]" }`}>
        <div className="flex justify-between pt-2 px-4 mb-8">
          <div></div>
          <div className="text-gray-600">{props.title}</div>
          <div
            className="text-gray-600 hover:scale-110 cursor-pointer"
            onClick={
              props.onClickCloseIcon
                ? () => props.onClickCloseIcon!()
                : () => ""
            }
          >
            <AiOutlineClose size={20} />
          </div>
        </div>
        {props.children ? props.children : ""}
      </div>
    </div>
  );
};

export default ModalTemplate;
