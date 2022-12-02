import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import { Configuration } from "../../types";
import ModalTemplate from "../templates/ModalTemplate";

/**
 * Modal to overwrite the general app settings.
 *
 * # Props:
 * * visible    - Flag to indicate wheter the modal should be displayed or not.
 * * setVisible - Function to change the value of prop `visible`.
 */
const SettingsModal: React.FC<{
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}> = (props) => {

  // Configuration object
  const [config, setConfig] = useState<Configuration>(null);
  // Supported Games
  const [games, setGames] = useState<string[]>([]);

  const gameRef = useRef<HTMLSelectElement>();

  // load default game options the first time this component is loaded
  useEffect(() => {
    invoke("get_game_variants_json")
    .then(result => setGames(JSON.parse(result as string)));
  }, []);

  // reload config from backend whenever this modal becomes visible
  useEffect(() => {
    if (props.visible) {
      loadConfig();
    }
  }, [props.visible]);

  // load configuration object from backend and store it to the state variable `config`.
  const loadConfig = async () => {
    const configObj = await invoke("get_configuration_json").then((config) =>
      JSON.parse(config as string)
    );
    setConfig(configObj);
    gameRef.current.value = configObj.defaultGame;
  };

  // send the state variable `config` to the backend in order to overwrite the general
  // app config.
  const saveConfig = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    invoke("store_configuration", { obj: JSON.stringify(config) }).then(() => {
      props.setVisible(false);
    });
  };

  // callback function to select the collection data store directory
  const selectStorageDir = async () => {
    const selected = await open({
      multiple: false,
      directory: true,
      title: "Select Directory",
    });
    if (selected) {
      let tmpConfig = config;
      tmpConfig.dataStorage = selected as string;
      setConfig({ ...tmpConfig });
    }
  };

  const selectDefaultGame = () => {
    let tmpConfig = config;
    tmpConfig.defaultGame = gameRef.current.value;
    setConfig({ ...tmpConfig });
  }

  return (
    <>
      {props.visible ? (
        <ModalTemplate
          title="Settings"
          onClickCloseIcon={() => props.setVisible(false)}
          modalStyle="w-[60%] h-[25%] lg:w-[50%] xl:w-[35%] 2xl:w-[30%]"
        >
          <div className="relative flex justify-center items-center text-gray-600 mx-8">
            <form onSubmit={(e) => saveConfig(e)}>
              <div className="grid grid-settings-8 gap-x-4 gap-y-4">
                <label className="text-sm col-span-1">Storage Directory</label>
                <input
                  className="col-span-7 text-sm border-2 cursor-pointer hover:bg-gray-200 hover:underline"
                  onClickCapture={() => selectStorageDir()}
                  value={config ? config.dataStorage : ""}
                />
               <label className="text-sm col-span-1">Default Game</label>
                <select
                  className="col-span-7 text-sm border-2"
                  ref={gameRef}
                  onChange={() => selectDefaultGame()}
                >
                  {games.map(game => <option value={game}>{game}</option>)}
                </select>
              </div>

              <div className="my-4 text-center">
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </ModalTemplate>
      ) : (
        ""
      )}
    </>
  );
};

export default SettingsModal;
