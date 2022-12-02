use serde::{Serialize, Deserialize};

use crate::util::enums::{Language, Condition};
use crate::util::collection::MapEntryWithId;
use crate::util::fs::parse_index_from_filename;

use super::set_services::Set;

use crate::templates;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Card {
    pub id: u32,
    pub amount: u8,
    pub name: String,
    pub set: Set,
    pub note: String,
    pub images: Vec<String>,
    pub language: Language,
    pub condition: Condition,
    pub foil: bool,
    pub signed: bool,
    pub altered: bool
}

/// implementation of the Card struct that is used by templates
/// to enable generic handling.
impl MapEntryWithId for Card {
    fn set_id(&mut self, id: u32) {
        self.id = id;
    }
    fn get_id(&self) -> u32 {
        self.id
    }
}

/// Parse the provided JSON object into an instance of `Card`, store it into 
/// the Magic collection hashmap and return the id of the new entry.
/// 
/// # Argument
/// obj     - Magic card instance as JSON object.
/// 
/// # Returns
/// New id of the entry withing the collection
/// 
pub fn add_card<'a>(obj: &str) -> Result<u32, &'a str> {
    templates::card_service_templates::add_entry_to_collection::<Card>("magic", obj)
}

/// Update the entry within the Magic collection hashmap with the same id as the
/// povided `Card` instance as JSON object. The old entry will be completely overwritten
/// with the data from the provided object.
/// 
/// # Argument
/// obj     - Pokemon card instance as JSON object.
/// 
pub fn update_card<'a>(obj: &str) -> Result<(), &'a str> {
    templates::card_service_templates::update_entry_in_collection::<Card>("magic", obj)
}

/// Delete the entry within the Magic collection hashmap with the provided id.
/// 
/// # Argument
/// id      - Id of the card within the collection that should be deleted.
///
pub fn delete_card<'a>(id: &u32) -> Result<(), &'a str> {
    let card: Card = templates::card_service_templates::get_entry_by_id::<Card>("magic", id).unwrap();
    for image in card.images.iter() {
        delete_image(image);
    }
    templates::card_service_templates::delete_entry_by_id::<Card>("magic", id)
}

/// Get the Magic collection hashmap as JSON encoded string.
/// 
pub fn get_collection_json<'a>() -> Result<String, &'a str> {
    templates::card_service_templates::get_collection_json::<Card>("magic")
}

/// Copy the image specfied by the image location parameter as an image that is 
/// related to the provided Card object to the collection's image directory. 
/// The flag `new_entry` indicates if the provided Card object is an existing object
/// within the collection or a new one. If it is a new one, this function will use
/// the next free id wihtin the collection for the name of the image that is copied.
/// 
/// # Arguments
/// obj             - JSON encoded Card instance of the card entry that the image should belong to.
/// img_location    - Ansolute path to the image that should be copied.
/// new_entry       - Indicator whether the related card entry is already stored in the collection
///                   or if it is a new entry that is not stored in the collection.
/// 
/// # Returns
/// New name of copied image within the card collection directory
/// 
pub fn copy_image<'a>(obj: &str, img_location: &str, new_entry: bool) -> Result<String, &'a str> {
    let card: Card = serde_json::from_str(obj).expect("Unable to deserialize card object.");

    // get next image index
    let mut index: u8 = 0;
    if card.images.len() > 0 {
        // support of file names of card collection manager v1. In this case, we start with index 0.
        let last_element = card.images.get(card.images.len() - 1).unwrap();
        if !(last_element.contains("IMG_FRONT") || last_element.contains("IMG_BACK")) {
            index = parse_index_from_filename(last_element.as_str()) + 1;
        }
    }

    // image name, if its a new entry, the template function will request the next id automatically
    let img_target_name: String = match new_entry {
        true => format!("{}+{}+{}", card.set.name, &card.name, index),
        false => format!("{}+{}+{}+{}", card.id, card.set.name, &card.name, index)
    };

    // todo- fallback support old card image names from card collection manager 1

    templates::card_service_templates::copy_image::<Card>(img_location, &img_target_name, "magic", new_entry)
}

/// Delete the image with the specified name from the card collection directory.
///
/// # Arguments
/// image       - Name of image that should be deleted.
///
pub fn delete_image<'a>(image: &str) -> Result<(), &'a str> {
    templates::card_service_templates::delete_image("magic", image)
}

/// Get the image with the specified name from the card collection directory 
/// as base-64 encoded string.
/// 
/// # Arguments
/// image       - Name of image that should be returned.
/// 
/// # Returns
/// Image as base-64 encoded string
/// 
pub fn get_image_b64<'a>(image: &str) -> Result<String, &'a str> {
    templates::card_service_templates::get_entry_image_b64("magic", image)
}