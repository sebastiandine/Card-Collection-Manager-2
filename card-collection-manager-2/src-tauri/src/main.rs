#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod pokemon;
mod magic;
mod util;
mod templates;

use tauri::{CustomMenuItem, Menu, Submenu};
use util::enums::Game;

#[tauri::command]
fn get_sets<'a>(game: Game) -> Result<String, &'a str> {
    match game {
        Game::Magic => magic::set_services::get_sets_json(true),
        Game::Pokemon => pokemon::set_services::get_sets_json(true)
    }
}

#[tauri::command]
fn update_sets<'a>(game: Game) -> Result<String, &'a str> {
    match game {
        Game::Magic => magic::set_services::get_sets_json(false),
        Game::Pokemon => pokemon::set_services::get_sets_json(false)
    }
}

#[tauri::command]
fn get_collection<'a>(game: Game) -> Result<String, &'a str> {
    match game {
        Game::Magic => magic::card_services::get_collection_json(),
        Game::Pokemon => pokemon::card_services::get_collection_json()  
    }
}

#[tauri::command]
fn add_card<'a>(obj: &str, game: Game) -> Result<u32, &'a str> {
    match game {
        Game::Magic => magic::card_services::add_card(obj),
        Game::Pokemon => pokemon::card_services::add_card(obj)
    }
}

#[tauri::command]
fn update_card<'a>(obj: &str, game: Game) -> Result<(), &'a str> {
    match game {
        Game::Magic => magic::card_services::update_card(obj),
        Game::Pokemon => pokemon::card_services::update_card(obj)
    }
}

#[tauri::command]
fn delete_card<'a>(id: u32, game: Game) -> Result<(), &'a str> {
    match game {
        Game::Magic => magic::card_services::delete_card(&id),
        Game::Pokemon => pokemon::card_services::delete_card(&id)
    }
}

#[tauri::command]
fn copy_image<'a>(obj: &str, img_location: &str, new_entry: bool, game: Game) -> Result<String, &'a str> {
    match game {
        Game::Magic => magic::card_services::copy_image(obj, img_location, new_entry),
        Game::Pokemon => pokemon::card_services::copy_image(obj, img_location, new_entry)
    }
}

#[tauri::command]
fn get_image_b64<'a>(image: &str, game: Game) -> Result<String, &'a str> {
    match game {
        Game::Magic => magic::card_services::get_image_b64(image),
        Game::Pokemon => pokemon::card_services::get_image_b64(image)
    }
}

#[tauri::command]
fn delete_image<'a>(image: &str, game: Game) -> Result<(), &'a str> {
    match game {
        Game::Magic => magic::card_services::delete_image(image),
        Game::Pokemon => pokemon::card_services::delete_image(image)
    }
}


fn main() {
    // configure menu

    // file menu
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit Application");
    let file_menu = Submenu::new("File", Menu::new().add_item(settings).add_item(quit));

    // game menu
    let game_pokemon = CustomMenuItem::new("switch_game/pokemon".to_string(), "Pokemon");
    let game_magic = CustomMenuItem::new("switch_game/magic".to_string(), "Magic");
    let game_menu = Submenu::new("Game", Menu::new().add_item(game_pokemon).add_item(game_magic));

    // update menu
    let update_sets_pokemon = CustomMenuItem::new("update/sets/pokemon".to_string(), "Update Pokemon");
    let update_sets_magic = CustomMenuItem::new("update/sets/magic".to_string(), "Update Magic");
    let update_menu = Submenu::new("Sets", Menu::new().add_item(update_sets_pokemon).add_item(update_sets_magic));

    let menu = Menu::new().add_submenu(file_menu).add_submenu(game_menu).add_submenu(update_menu);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            util::config::get_configuration_json,
            util::config::store_configuration,
            util::enums::get_condition_variants_json,
            util::enums::get_language_variants_json,
            util::enums::get_game_variants_json,
            add_card,
            get_sets,
            update_sets,
            get_collection,
            copy_image,
            get_image_b64,
            delete_image,
            delete_card,
            update_card
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
