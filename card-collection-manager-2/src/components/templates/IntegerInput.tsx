import React, { forwardRef } from "react";

/**
 * HTMLInput Element for numeric values with additional validation so that only positive integer
 * values can be entered.
 */

const IntegerInput = forwardRef((props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, ref: React.MutableRefObject<HTMLInputElement>) => {
    
    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;
        if(value.includes('.') || value.includes('-') || value === ""){
            ref.current.value = "1";
        }
    }

    return (
        <input 
            type="number" 
            min={props.min ? props.min : 1} 
            step={props.step ? props.step : 1} 
            defaultValue={props.defaultValue ? props.defaultValue : 1} 
            className={props.className ? props.className : ""}
            required={props.required ? props.required : false}
            ref={ref ? ref : null}
            onInput={(e) => handleChange(e)}
        />
    )
});

export default IntegerInput;