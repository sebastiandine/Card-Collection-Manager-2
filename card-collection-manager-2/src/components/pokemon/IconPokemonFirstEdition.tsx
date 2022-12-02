import React from "react";

/**
 * Rebuilding of the 1. Edition Icon
 */
const IconPokemonFirstEdition: React.FC<{className?: string}> = (props) => {
    return (
        <div className={`flex items-center justify-center ${props.className ? props.className: ""}`}>
        <div className="rounded-full bg-black text-white px-1 text-xs font-bold">
          1
        </div>
      </div>
    )
}

export default IconPokemonFirstEdition;