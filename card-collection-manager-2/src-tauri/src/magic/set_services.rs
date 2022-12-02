use crate::templates;
use serde::{Deserialize, Serialize};

// Magic set information
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Set {
    /// set id accoring to API at `https://api.magicthegathering.io`
    pub id: String,
    /// actual set name
    pub name: String,
    /// release date in format YYYY/MM/DD
    #[serde(rename = "releaseDate")]
    pub release_date: String,
}

/// Get all MTG sets as vector of `Set` instances.
/// Implicitly, this function also stores the resulting data in JSON format
/// at `<storage_location>/magic/sets.json`.
///
/// This function call the REST-API at `https://api.magicthegathering.io` to retrieve the data.
///
pub fn update_sets<'a>() -> Result<Vec<Set>, &'a str> {
    #[derive(Serialize, Deserialize, Debug, Clone)]
    struct TmpSet {
        pub code: String,
        pub name: String,
        pub released_at: String,
        pub digital: bool,
    }

    #[derive(Serialize, Deserialize, Debug)]
    struct Response {
        data: Vec<TmpSet>,
    }

    let resp = reqwest::blocking::get("https://api.scryfall.com/sets")
        .unwrap()
        .json::<Response>()
        .unwrap();

    // filter out 'onlyOnline', map to final struct and sort by release date
    let mut prepared_sets = resp
        .data
        .iter()
        .filter(|&set| !set.digital)
        .map(|set| Set {
            id: set.code.clone(),
            name: set.name.clone(),
            release_date: set.released_at.clone().replace("-", "/"),
        })
        .collect::<Vec<_>>();
    prepared_sets.sort_by_key(|set| set.release_date.clone());
    store_sets(&prepared_sets).unwrap();

    Ok(prepared_sets)
}

/// Get all available MTG sets from either the locally stored file at `<storage_location>/magic/sets.json`
/// or a fresh fetch from the corresponding API, in JSON format as a string.
/// If the file does not exist, it will automatically fetch the data from the
/// REST-API, store the result in the `sets.json` file and return the data as JSON.
/// 
/// # Arguments
/// `from_local`    - If `true`, the function will try to access the local `set.json` file and only
///                   fetch the API, if it cannot find this file. If `false`, it will fetch the API
///                   for set data, store it in the local `set.json` file and then provide its content
///                   as a JSON string.
/// 
pub fn get_sets_json<'a>(from_local: bool) -> Result<String, &'a str> {
   
    let game = "magic";

    // in case `from_local` is false, we perform a fresh data fetch from the API before we
    // return data.
    if !from_local {
        update_sets().unwrap();
    }

    // in any case we will check if `set.json` already exisits. If it is not the case, 
    // we will perform an API fetch before (see `Err` branch).
    match templates::set_service_templates::get_sets_json(game) {
        Ok(sets) => Ok(sets),
        Err(_) => {
            update_sets().unwrap();
            Ok(templates::set_service_templates::get_sets_json(game).unwrap())
        }
    }
}

/// Store the provided set data in JSON format at `<storage_location>/magic/sets.json`.
///
/// # Argument
/// `sets`  - Vector of Set instances that should be stored as JSON.
///
pub fn store_sets<'a>(sets: &Vec<Set>) -> Result<(), &'a str> {
    templates::set_service_templates::store_sets::<Set>("magic", sets)
}
