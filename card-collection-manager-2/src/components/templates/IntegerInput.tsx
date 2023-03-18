import React, { forwardRef } from "react";

/**
 * Input element for numeric values with additional validation so that only positive integer
 * values can be entered.
 * 
 * Optional Props:
 * ===============
 * - min            (number)                    minimal value of field's value                      (default: 1)
 * - step           (number)                    step/Distance between successive values             (default: 1)
 * - defaultValue   (number)                    default value of the field                          (default: 1)
 * - className      (string)                    component styling                                   (default: "")
 * - required       (boolean)                   indicator, wheter this field is mandatory           (default: false)
 * - ref            (React.MutableRefObject)    useRef hook to perist the value between rendering   (default: null)
 * 
 * Usage example:
 * ==============
 * ```
 * import React, { useRef }from "react";
 * 
 * const UsageExample: React.FC<{}> = () => {
 *   const inputRef = useRef<HTMLInputElement>(null);
 * 
 *   const printValue = () => {
 *     console.log(Number.parseInt(inputRef.current!.value))
 *   }
 * 
 *   return (
 *     <div>
 *       <IntegerInput ref={inputRef} />
 *       <button onClick(printValue)>Click</button>
 *     <div>
 *   );
 * }
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