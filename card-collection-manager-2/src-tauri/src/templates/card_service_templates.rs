use std::io::{Read, Write};
use std::collections::HashMap;
use std::path::Path;
use std::ffi::OsStr;
use std::fs::{File, create_dir, copy, remove_file};
use serde::{Serialize};
use serde::de::DeserializeOwned;
use image::{DynamicImage, ImageOutputFormat};
use std::io::Cursor;

use crate::util::config::{Configuration, load_configuration};
use crate::util::collection::{MapEntryWithId, add_map_entry, get_next_id};
use crate::util::fs::format_text_for_fs;

/// Add the povided object as a new entry to the collection of the provided game, store the new update
/// to the collection file of the game and return the new id of the entry in the collection.
/// 
/// # Arguments
/// `game`  - Game name to specifiy to which collection the entry should be added
/// `obj`   - New entry as JSON string
/// 
/// # Returns
/// New id of the entry withing the collection
/// 
pub fn add_entry_to_collection<'a, T: Serialize + DeserializeOwned + MapEntryWithId>(game: &str, obj: &str) -> Result<u32, &'a str> {
    let entry: T = serde_json::from_str(obj).expect("Unable to deserialize entry object.");
    let mut collection: HashMap<u32, T> = load_collection::<T>(game).unwrap();
    let id: u32 = add_map_entry::<T>(&mut collection, entry);
    store_collection::<T>(game, &collection).expect("Unable to store updated collection.");
    Ok(id)
}

/// Update an existing entry in the collection of the provided game, with the provided object.
/// The id within the provided object specficies, which existing entry should be updated.
/// 
/// # Arguments
/// `game`  - Game name to specifiy in which collection the entry should be updated
/// `obj`   - entry as JSON string
/// 
pub fn update_entry_in_collection<'a, T: Serialize + DeserializeOwned + MapEntryWithId>(game: &str, obj: &str) -> Result<(), &'a str> {
    let entry: T = serde_json::from_str(obj).expect("Unable to deserialize entry object.");
    let mut collection: HashMap<u32, T> = load_collection::<T>(game).unwrap();
    let id: u32 = entry.get_id();
    collection.insert(id, entry).expect("Unable to update collection");
    store_collection::<T>(game, &collection).expect("Unable to store updated collection.");
    Ok(())
}
/// Return the entry with the specfied `id` from the collection corresponding to the specified `game`.
/// 
/// # Arguments
/// `game`  - Game name to specifiy from which collection the entry should be retrieved
/// `id`    - Id of the entry that should be retrieved
/// 
/// # Returns
/// Entry record with the specified id from the specified collection
/// 
pub fn get_entry_by_id<'a, T: Serialize + DeserializeOwned + Clone>(game: &str, id: &u32) -> Result<T, &'a str> {
    let collection: HashMap<u32, T> = load_collection::<T>(game).unwrap();
    match collection.get(id) {
        Some(entry) => Ok(entry.clone()),
        None => Err("Unable to get entry")
    }
}

/// Delete the entry with the specfied `id` from the collection corresponding to the specified `game`.
/// 
/// # Arguments
/// `game`  - Game name to specifiy from which collection the entry should be deleted
/// `id`    - Id of the entry that should be deleted
/// 
pub fn delete_entry_by_id<'a, T: Serialize + DeserializeOwned + Clone>(game: &str, id: &u32) -> Result<(), &'a str> {
    let mut collection: HashMap<u32, T> = load_collection::<T>(game).unwrap();
    collection.remove(id).unwrap();
    store_collection::<T>(game, &collection)
}

/// Get the collection as a JSON map corresponding to the provided game from the local collection.json file that
/// belongs to this game. If this file does not exist, it will be generated.
/// 
/// # Arguments
/// `game`  - Game name for which the collection should be returned
/// 
/// # Returns
/// string with a map of the collection data
/// 
pub fn get_collection_json<'a, T: Serialize + DeserializeOwned>(game: &'a str) -> Result<String, &'a str> {
    let collection = load_collection::<T>(game).unwrap();
    match serde_json::to_string(&collection) {
        Ok(json) => Ok(json),
        Err(_) => Err("Unable to serialize collection to JSON.")
    }
}

/// Load the collection related to the provided game from the corresponding collection file and
/// return it as a hash map.
/// 
/// # Arguments
/// `game`  - Game name to specify which collection should be loaded
/// 
/// # Returns
/// The collection corresponding to the game name as a hash map
/// 
fn load_collection<'a, T: Serialize + DeserializeOwned>(game: &str) -> Result<HashMap<u32, T>, &'a str> {

    let config: Configuration = load_configuration().unwrap();

    let collection_file = format!("{}/{}/collection.json", &config.data_storage, game);
    let collection_file_path = Path::new(&collection_file);

    if collection_file_path.exists() {
        let mut data = String::new();
        let mut f = File::open(&collection_file_path).expect("Unable to open file stream.");
        f.read_to_string(&mut data).expect("Unable to read file to string.");
        let collection: HashMap<u32, T> = serde_json::from_str(&data).expect("Unable to deserialize collection.");
        Ok(collection)
    }
    else {
        let collection: HashMap<u32, T> = HashMap::new();
        store_collection::<T>(game, &collection).unwrap();
        Ok(collection)
    }
}

/// Store the provided collection to the corresponding file specified by the provided game name.
/// 
/// # Arguments
/// `game`          -   Game name to specify to which game the provided collection belongs
/// `collection`    -   Collection that should be stored to the collection file corresponding to the provided game
/// 
fn store_collection<'a, T: Serialize>(game: &str, collection: &HashMap<u32, T>) -> Result<(), &'a str> {
    let config: Configuration = load_configuration().unwrap();

    let game_dir = format!("{}/{}", &config.data_storage, game);
    let collection_file = format!("{}/{}/collection.json", &config.data_storage, game);
    let game_dir_path = Path::new(&game_dir);
    let collection_file_path = Path::new(&collection_file);

    // check if game subdir exists
    if !game_dir_path.exists() {
        create_dir(game_dir_path).unwrap();
    }

    let collection_json = serde_json::to_string(collection).expect("Unable to serialize collection to JSON.");
    let mut collection_file = File::create(&collection_file_path).expect("Unable to create 'collection.json' file.");
    collection_file.write_all(&collection_json.as_bytes()).expect("Unable to write JSON-serialized collection to 'collection.json'.");
    Ok(())
}

/// Copy the image from the location specified via `img_location`. The path of the copied file depends on the specified `game`,
/// the string provided via `img_target_name` and the flag `new_entry`. `game` basically translates into the corresponding
/// game sub-directory in the apps storage directory. `img_target_name` is an arbitrary string that is used as the name of the 
/// copied file. If the flag `new_entry` is `true`, this function will fetch the next id of the game's collection and use it
/// as a prefix of the copied file name. Otherwise, it will simply use `img_target_name` as the filename.
/// 
/// # Arguments
/// `img_location`      -   Absolute path to the image that should be copied
/// `img_target_name`   -   Name that should be used for the copy
/// `game`              -   Game name to specify to which game the image belongs
/// `new_entry`         -   Flag to indicate if the image belogns to a new entry (`true`) or an existing one (`false`).
///                         In case of a new entry, the next id of the game's collection will be used as a prefix for 
///                         the new image name.
/// 
/// # Returns
/// The name of the new image file.
/// 
pub fn copy_image<'a, T: Serialize + DeserializeOwned>(img_location: &str, img_target_name: &str, game: &str, new_entry: bool) -> Result<String, &'a str> {
    let config = load_configuration().expect("Unable to load configuration");
    let file_extension = Path::new(&img_location).extension().and_then(OsStr::to_str).unwrap();

    let mut new_filename: String = format_text_for_fs(&format!("{}.{}",img_target_name, file_extension));

    if new_entry {
        let collection: HashMap<u32, T> = load_collection::<T>(game).unwrap();
        let id: u32 = get_next_id::<T>(&collection);
        new_filename = format!("{}+{}", id, &new_filename);
    }

    // check if image dir exists
    let image_dir = format!("{}/{}/images", &config.data_storage, game);
    let image_dir_path = Path::new(&image_dir);
    if !image_dir_path.exists() {
        create_dir(image_dir_path).unwrap();
    }

    let copy_target = format!("{}/{}", &image_dir, &new_filename);
    copy(img_location, &copy_target).expect("Unable to copy file.");
    Ok(new_filename)
}

/// Returns the image, specified by the provided `game` and `image` name as a base-64 encoded string.
/// 
/// # Arguments
/// `game`  -   Game name to specify to which game the image belongs
/// `image` -   Name of the image to returns
/// 
/// # Returns
/// Specified image as base-64 encoded string.
/// 
pub fn get_entry_image_b64<'a>(game: &str, image: &str) -> Result<String, &'a str> {
    let config = load_configuration().expect("Unable to load configuration");
    let file_extension = Path::new(image).extension().and_then(OsStr::to_str).unwrap();
    let image_location = format!("{}/{}/images/{}", &config.data_storage, game, image); 
    let img: DynamicImage = image::open(&image_location).unwrap();
    let mut img_data: Vec<u8> = Vec::new();

    let format = match file_extension {
        "png" => ImageOutputFormat::Png,
        "jpg" => ImageOutputFormat::Jpeg(255),
        "jpeg" => ImageOutputFormat::Jpeg(255),
        _ => ImageOutputFormat::Png,
    };

    img.write_to(&mut Cursor::new(&mut img_data), format).unwrap();
    let img_data_b64 = format!("data:image/{};base64,{}", file_extension, base64::encode(img_data));
    Ok(img_data_b64)
}

/// Delete the image, specified by the provided `game` and `image` name.
/// 
/// # Arguments
/// `game`  -   Game name to specify to which game the image belongs
/// `image` -   Name of the image to delete
/// 
pub fn delete_image<'a>(game: &str, image: &str) -> Result<(), &'a str> {
    let config = load_configuration().expect("Unable to load configuration");
    let image_location = format!("{}/{}/images/{}", &config.data_storage, game, image); 
    let image_location_path = Path::new(&image_location);
    remove_file(image_location_path).expect("Unable to delete image.");
    Ok(())
}