use std::collections::HashMap;

/// Trait that a type needs to implement in order to use function `add_map_entry`
/// for a hash map that refers to the type.
/// 
pub trait MapEntryWithId {
    fn set_id(&mut self, id: u32);
    fn get_id(&self) -> u32;
}

pub fn get_next_id<T>(map: &HashMap<u32, T>) -> u32 {
    match map.keys().max() {
        None => 0,
        Some(i) => i + 1
    }
}

/// Adds the provided entry to the provided map, set its field `id` to the new id 
/// of the map and returns that id.
/// 
/// # Arguments
/// `map`   - HashMap to which the provided entry should be added
/// `entry` - Entry that should be added to the provided map with a new id of the map
/// 
/// # Returns
/// Id of the new entry
/// 
pub fn add_map_entry<T: MapEntryWithId>(map: &mut HashMap<u32, T>, mut entry: T) -> u32 {
    let id: u32 = get_next_id::<T>(&map);
    entry.set_id(id);
    map.insert(id, entry);
    id
}

