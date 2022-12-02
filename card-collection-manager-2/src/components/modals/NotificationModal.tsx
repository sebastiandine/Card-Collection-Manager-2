import React, { Dispatch, SetStateAction } from "react";

import ModalTemplate from "../templates/ModalTemplate";

/**
 * A modal to notify the user.
 * 
 * # Props:
 * * visible        - Flag to indicate wheter the modal should be displayed or not.
 * * setVisible     - Function to change the value of prop `visible`.
 * * title          - (Optional) title of the modal, default is 'Notification'.
 * * text           - (Optional) text of the modal, default is 'Process completed successfully.'.
 */
const NotificationModal: React.FC<{
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  title?: string;
  text?: string;
}> = (props) => {

  return (
    <>
      {props.visible ? (
        <ModalTemplate
          title={props.title ? props.title : "Notification"}
          onClickCloseIcon={() => props.setVisible(false)}
          modalStyle="w-[60%] h-[20%] lg:w-[50%] xl:w-[35%] 2xl:w-[30%]"
        >
          <div className="relative justify-center items-center text-center text-gray-600 mx-8">
            <div>
                {props.text ? props.text : "Process completed successfully."}
            </div>
            <div className="my-8 flex text-center items-center justify-center">
                <button type="submit" className="mx-2" onClick={() => props.setVisible(false)}>Ok</button>
            </div>
          </div>
        </ModalTemplate>
      ) : (
        ""
      )}
    </>
  );
};

export default NotificationModal;
