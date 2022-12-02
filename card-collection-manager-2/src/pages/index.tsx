import { useEffect, useState } from "react";

import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

import { VscAdd, VscEdit, VscTrash } from "react-icons/vsc";

import { SettingsModal, ConfirmationModal, NotificationModal, ImageModal } from "../components/modals";
import { CreateEditPokemonModal, Mode, PokemonTable, SelectedPokemonPanel } from "../components/pokemon";
import { CreateEditMtgModal, MtgTable, SelectedMtgPanel } from "../components/magic";

import { CardEntry as PokemonCardEntry } from "../types/pokemon";
import { CardEntry as MagicCardEntry } from "../types/magic";


function App() {

  const [collection, setCollection] = useState<PokemonCardEntry[] | MagicCardEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PokemonCardEntry | MagicCardEntry>(null);

  const [activeGame, setActiveGame] = useState<string>(null);

  const [createEditMode, setCreateEditMode] = useState<Mode>(Mode.Create);

  const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const [createEditModalVisible, setCreateEditModalVisible] = useState<boolean>(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState<boolean>(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState<boolean>(false);

  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [imageModalImageIndex, setImageModalImageIndex] = useState<number>(0);
  const [imageModalImages, setImageModalImages] = useState<string[]>([]);

  /**
   * on initial render:
   * - get configuration from backend and set the active game to the default game from the config
   * - connect all menu bar events with their individual actions
   */
  useEffect(() => {
    invoke("get_configuration_json").then((result) => {
      const config = JSON.parse(result as string);
      setActiveGame(config.defaultGame);
    });

    // listen for general menu events
    listen("tauri://menu", (event) => {
      if (event.payload == "settings") {
        setSettingsModalVisible(true);
      }
      if (event.payload == "switch_game/pokemon") {
        setActiveGame("Pokemon");
        setSelectedEntry(null);
      }
      if (event.payload == "switch_game/magic") {
        setActiveGame("Magic");
        setSelectedEntry(null);
      }
      if (event.payload == "update/sets/pokemon") {
        invoke("update_sets", {game: "Pokemon"})
        .then(() => setNotificationModalVisible(true));
      }
      if (event.payload == "update/sets/magic") {
        invoke("update_sets", {game: "Magic"})
        .then(() => setNotificationModalVisible(true));
      }
    });
  }, []);

  /**
   * Everytime the active game changes, fetch the corresponding collection
   * of the active game from the backend.
   */
  useEffect(() => {
    if (activeGame) {
      invoke("get_collection", { game: activeGame }).then((result) => {
        const obj = JSON.parse(result as string);
        if (activeGame == "Pokemon")
          setCollection(Object.values(obj) as PokemonCardEntry[]);
        if (activeGame == "Magic")
          setCollection(Object.values(obj) as MagicCardEntry[]);
      });
    }
  }, [activeGame]);

  
  const deleteSelectedCard = () => {
    invoke("delete_card", { id: selectedEntry.id, game: activeGame }).then(
      (result) => {
        if (activeGame == "Pokemon")
          setCollection(
            (collection as PokemonCardEntry[]).filter(
              (entry) => entry.id != selectedEntry.id
            )
          );
        if (activeGame == "Magic")
          setCollection(
            (collection as MagicCardEntry[]).filter(
              (entry) => entry.id != selectedEntry.id
            )
          );
        setSelectedEntry(null);
      }
    );
  };

  return (
    <div>
      <div className="fixed flex w-full h-full z-[1] m-4">
        <div className="w-[30%] 2xl:w-[20%]">
          <div className="flex">
            <div
              className="mr-2 border-2 rounded-sm border-gray-600 p-2 shadow-lg shadow-gray-400 cursor-pointer hover:scale-105"
              onClick={() => {
                setCreateEditMode(Mode.Create);
                setCreateEditModalVisible(true);
              }}
            >
              <VscAdd />
            </div>
            <div
              className={`mr-2 border-2 rounded-sm border-gray-600 p-2 shadow-lg shadow-gray-400 cursor-pointer hover:scale-105 ${
                selectedEntry ? "" : "invisible"
              }`}
              onClick={() => {
                setCreateEditMode(Mode.Edit);
                setCreateEditModalVisible(true);
              }}
            >
              <VscEdit />
            </div>
            <div
              className={`mr-2 border-2 rounded-sm border-gray-600 p-2 shadow-lg shadow-gray-400 cursor-pointer hover:scale-105 ${
                selectedEntry ? "" : "invisible"
              }`}
              onClick={() => setDeleteConfirmModalVisible(true)}
            >
              <VscTrash />
            </div>
          </div>
          {activeGame == "Pokemon" ? (
            <SelectedPokemonPanel
              entry={selectedEntry as PokemonCardEntry}
              setImageModalImages={setImageModalImages}
              setImageModalImageIndex={setImageModalImageIndex}
              setImageModalVisible={setImageModalVisible}
            />
          ) : (
            ""
          )}
          {activeGame == "Magic" ? (
            <SelectedMtgPanel
              entry={selectedEntry as MagicCardEntry}
              setImageModalImages={setImageModalImages}
              setImageModalImageIndex={setImageModalImageIndex}
              setImageModalVisible={setImageModalVisible}
            />
          ) : (
            ""
          )}
        </div>
        <div className="w-[70%] h-[95%] 2xl:w-[80%]">
          {activeGame == "Pokemon" ? (
            <PokemonTable
              collection={collection as PokemonCardEntry[]}
              selectedEntry={selectedEntry as PokemonCardEntry}
              setCollection={setCollection}
              setSelectedEntry={setSelectedEntry}
            />
          ) : (
            ""
          )}
          {activeGame == "Magic" ? (
            <MtgTable
              collection={collection as MagicCardEntry[]}
              selectedEntry={selectedEntry as MagicCardEntry}
              setCollection={setCollection}
              setSelectedEntry={setSelectedEntry}
            />
          ) : (
            ""
          )}
        </div>
      </div>

      <div></div>
      <SettingsModal
        visible={settingsModalVisible}
        setVisible={setSettingsModalVisible}
      />
      {activeGame == "Pokemon" ? (
        <CreateEditPokemonModal
          visible={createEditModalVisible}
          setVisible={setCreateEditModalVisible}
          selectedEntry={selectedEntry as PokemonCardEntry}
          setSelectedEntry={setSelectedEntry}
          mode={createEditMode}
          collection={collection as PokemonCardEntry[]}
          setCollection={setCollection}
          setImageModalImages={setImageModalImages}
          setImageModalImageIndex={setImageModalImageIndex}
          setImageModalVisible={setImageModalVisible}
        />
      ) : (
        ""
      )}
      {activeGame == "Magic" ? (
        <CreateEditMtgModal
          visible={createEditModalVisible}
          setVisible={setCreateEditModalVisible}
          selectedEntry={selectedEntry as MagicCardEntry}
          setSelectedEntry={setSelectedEntry}
          mode={createEditMode}
          collection={collection as MagicCardEntry[]}
          setCollection={setCollection}
          setImageModalImages={setImageModalImages}
          setImageModalImageIndex={setImageModalImageIndex}
          setImageModalVisible={setImageModalVisible}
        />
      ) : (
        ""
      )}
      <ImageModal
        visible={imageModalVisible}
        setVisible={setImageModalVisible}
        game={activeGame}
        images={imageModalImages}
        startIndex={imageModalImageIndex}
      />
      <ConfirmationModal
        visible={deleteConfirmModalVisible}
        setVisible={setDeleteConfirmModalVisible}
        confirmAction={deleteSelectedCard}
        title="Delete Entry"
        text="Do you really want to delete this entry?"
      />
      <NotificationModal
        visible={notificationModalVisible}
        setVisible={setNotificationModalVisible}
        title="Sets Update"
        text="Sets were updated successfully."
      />
    </div>
  );
}

export default App;
