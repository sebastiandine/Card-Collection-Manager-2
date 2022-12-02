use std::io::{Read, Write};
use std::path::Path;
use std::fs::{File, create_dir};
use serde::{Serialize};
use crate::util::config::{Configuration, load_configuration};

/// Get all sets as a JSON list corresponding to the provided game from the local sets.json file that
/// belongs to this game. If this file does not exist, the function will return an error.
/// 
/// # Arguments
/// `game`  - Game name for which the sets should be returned
/// 
/// # Returns
/// string with a list of set objects if the corresponding file exists
/// 
pub fn get_sets_json<'a>(game: &'a str) -> Result<String, &'a str> {
    let config: Configuration = load_configuration().unwrap();

    let set_file = format!("{}/{}/sets.json", &config.data_storage, game);
    let set_file_path = Path::new(&set_file);

    if set_file_path.exists() {
        let mut data = String::new();
        let mut f = File::open(&set_file_path).expect("Unable to open file stream.");
        f.read_to_string(&mut data).expect("Unable to read file to string.");
        Ok(data)
    }
    else {
        Err("File does not exist.")
    }
}

/// Store the povided vector of sets to the set file corresponding to the provided game.
/// 
/// # Arguments
/// `game`  - Game name to specify to which game the provided sets belong
/// `sets`  - Vector of sets that should be stored in the set file corresponding to the provided game
/// 
pub fn store_sets<'a, T: Serialize>(game: &'a str, sets: &Vec<T>) -> Result<(), &'a str> {
    let config: Configuration = load_configuration().unwrap();

    let game_dir = format!("{}/{}", &config.data_storage, game);
    let set_file = format!("{}/{}/sets.json", &config.data_storage, game);
    let game_dir_path = Path::new(&game_dir);
    let set_file_path = Path::new(&set_file);

    // check if game subdir exists
    if !game_dir_path.exists() {
        create_dir(game_dir_path).unwrap();
    }

    let set_json = serde_json::to_string(sets).expect("Unable to serialize set data to JSON.");
    let mut set_file = File::create(&set_file_path).expect("Unable to create 'sets.json' file.");
    set_file.write_all(&set_json.as_bytes()).expect("Unable to write JSON-serialized sets to 'set.json'.");
    Ok(())
}