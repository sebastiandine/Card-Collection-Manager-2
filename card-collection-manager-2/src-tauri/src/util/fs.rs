use nom::character::is_digit;
use std::path::Path;
use std::ffi::OsStr;

/// Replace problematic characters in a text in order to 
/// avoid any conflicts when using the text to create a
/// file.
pub fn format_text_for_fs(text: &String) -> String {
    text
    .replace("'", "")
    .replace("`", "")
    .replace(",","")
    .replace(" ", "")
    .replace(":", "-")
    .replace("&", "And")
    .replace("|", "Or")
    .replace("á", "a")
    .replace("é", "e")
    .replace("í", "i")
    .replace("ó", "o")
    .replace("ú", "u")
    .replace("û", "u")
}

/// Parse an index from the end of a filename. This function supports indices with 
/// 1 and 2 digit indices.
/// 
/// Example:
/// image1.png -> 1
/// image22.jpeg -> 22
/// 
pub fn parse_index_from_filename(filename: &str) -> u8 {
    
    // get offset according to extension 
    let file_extension = Path::new(filename).extension().and_then(OsStr::to_str).unwrap();
    let offset = file_extension.len() + 1;

    let mut index_len = 1;
    
    // try if index is 2 digits long
    let two_digits_test: String = filename.chars().skip(filename.len() - offset - 2).take(1).collect();
    if is_digit(two_digits_test.as_bytes()[0]) {
        index_len = 2;
    }
    
    // extract index
    let index: String = filename.chars().skip(filename.len() - offset - index_len).take(index_len).collect();
    index.parse::<u8>().unwrap()
}
