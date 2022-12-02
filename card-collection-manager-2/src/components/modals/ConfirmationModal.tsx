import React, { Dispatch, SetStateAction } from "react";

import ModalTemplate from "../templates/ModalTemplate";

/**
 * A modal to ask for confirmation and trigger actions based on the decision.
 * 
 * # Props:
 * * visible        - Flag to indicate wheter the modal should be displayed or not.
 * * setVisible     - Function to change the value of prop `visible`.
 * * confirmAction  - Function that should be executed when the user confirms the action.
 * * abortAction    - (Optional) function that should be executed when the user aborts the action. By default, the modal is just closed.
 * * title          - (Optional) title of the modal, default is 'Confirmation'.
 * * text           - (Optional) text of the modal, default is 'Do you want to proceed?'.
 */
const ConfirmationModal: React.FC<{
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  confirmAction: Function;
  abortAction?: Function;
  title?: string;
  text?: string;
}> = (props) => {

    const confirmAction = () => {
        props.confirmAction();
        props.setVisible(false);
    }

    const abortAction = () => {
        if(props.abortAction) {
            props.abortAction();
        }
        props.setVisible(false);
    }

  return (
    <>
      {props.visible ? (
        <ModalTemplate
          title={props.title ? props.title : "Confirmation"}
          onClickCloseIcon={() => props.setVisible(false)}
          modalStyle="w-[60%] h-[20%] lg:w-[50%] xl:w-[35%] 2xl:w-[30%]"
        >
          <div className="relative justify-center items-center text-center text-gray-600 mx-8">
            <div>
                {props.text ? props.text : "Do you want to proceed?"}
            </div>
            <div className="my-8 flex text-center items-center justify-center">
                <button type="submit" className="mx-2" onClick={() => confirmAction()}>Confirm</button>
                <button type="submit" className="mx-2" onClick={() => abortAction()}>Abort</button>
            </div>
          </div>
        </ModalTemplate>
      ) : (
        ""
      )}
    </>
  );
};

export default ConfirmationModal;
