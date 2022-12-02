use std::path::Path;
use std::fs::File;
use std::io::{Read, Write};
use std::env::current_dir;
use serde::{Serialize, Deserialize};

use super::enums::Game;

/// General application configuration
#[derive(Serialize, Deserialize, Debug)]
pub struct Configuration {
    /// Absolute path to the location, where all collection data should be stored.
    #[serde(rename = "dataStorage")]
    pub data_storage: String,
    /// Default game to start the app with
    #[serde(rename = "defaultGame")]
    pub default_game: Game
}

/// Get the application_s configuration from the config file at `config.json` 
/// as instance of struct `Configuration`. If the file does not exist, it will
/// be generated automatically.
/// 
pub fn load_configuration<'a>() -> Result<Configuration, &'a str> {

    if Path::new("config.json").exists() {
        let mut data = String::new();
        let mut f = File::open("config.json").expect("Unable to open file stream.");
        f.read_to_string(&mut data).expect("Unable to read config file to string.");
        Ok(serde_json::from_str(&data).expect("Unable to deserialize configuration."))
    }
    else {
        let config = Configuration { data_storage: current_dir().unwrap().to_str().unwrap().to_string(), default_game: Game::Magic };
        store_configuration(&serde_json::to_string(&config).expect("Unable to serialize configuration.")).unwrap();
        load_configuration()
    }
}

/// Overwrite the current configuration file with the JSON data provided by this function.
/// 
/// # Argument
/// * `obj` - A string that contains the new app configuration as a JSON object.
/// 
#[tauri::command]
pub fn store_configuration<'a>(obj: &'a str) -> Result<(), &'a str> {
    let mut file = File::create("config.json").expect("Unable to create file.");
    file.write_all(obj.as_bytes()).expect("Unable to write file.");
    Ok(())
}

/// Get the app configuration from file `config.json` in JSON format as a string. 
#[tauri::command]
pub fn get_configuration_json<'a>() -> Result<String, &'a str> {
    let configuration = load_configuration().expect("Unable to load configuration");
    Ok(serde_json::to_string(&configuration).expect("Unable to serialize configuration."))
}