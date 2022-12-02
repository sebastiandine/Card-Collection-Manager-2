use serde::{Serialize, Deserialize};

use strum::IntoEnumIterator; 
use strum_macros::EnumIter; 

#[derive(Serialize, Deserialize, Debug, Clone, EnumIter)]
pub enum Language {
    English, 
    German,
    French, 
    Spanish, 
    Italian, 
    Chinese, 
    Japanese, 
    Russian
}

#[derive(Serialize, Deserialize, Debug, Clone, EnumIter)]
pub enum Condition {
    Mint, 
    NearMint, 
    Excellent, 
    Good, 
    LightPlayed, 
    Played, 
    Poor
}

#[derive(Serialize, Deserialize, Debug, Clone, EnumIter)]
pub enum Game {
    Magic,
    Pokemon
}

fn get_enum_variants<T: IntoEnumIterator>() -> Vec<T> {
    let mut variants: Vec<T> = Vec::new();
    for variant in T::iter() {
        variants.push(variant);
    }
    variants
}

/// Get all possible languages that are supported by the app.
#[tauri::command]
pub fn get_language_variants_json() -> Result<String, String> {
    Ok(serde_json::to_string(&get_enum_variants::<Language>()).unwrap())
}

/// Get all possible card conditions that are supported by the app.
#[tauri::command]
pub fn get_condition_variants_json() -> Result<String, String> {
    Ok(serde_json::to_string(&get_enum_variants::<Condition>()).unwrap())
}

/// Get all possible games that are supported by the app.
#[tauri::command]
pub fn get_game_variants_json() -> Result<String, String> {
    Ok(serde_json::to_string(&get_enum_variants::<Game>()).unwrap())
}