import React, { useState } from "react";
import { EntryTemplate } from "../../types";

/**
 * Table field configuration object. Each field maps to one column of the table.
 *
 * * label     - used as column label if no icon is specfied
 * * icon      - (Optional) used as column label and cell value for boolean values
 * * valueKey  - Accessor key to the field on an data entry object that maps to the
 *               field described by this config object. This value will be used for display
 *               inside the table cell.
 *               For nested access, use a `.` to define nested routes (see function `getValByKey`
 *               for more information).
 * * sortKey   - Accessor key to the field on an data entry object that maps to the
 *               field described by this config object. This value will be used for sorting
 *               entries by the attrbiute that this field represents.
 *               For nested access, use a `.` to define nested routes (see function `getValByKey`
 *               for more information).
 */
type TableField = {
  label: string;
  icon?: React.FC | JSX.Element;
  valueKey: string;
  sortKey: string;
};

/** 
 * Helper function to support access to fields of nested objects
 * with dynamic key routes as strings.
 *
 * e.g
 * obj: {a: "hello"}              keyRoute: "a"     => "hello"
 * obj: {a: "hello", b: {c: 42}}  keyRoute: "b"     => {c: 42}
 * obj: {a: "hello", b: {c: 42}}  keyRoute: "b.c"   => 42
 */
const getValByKey = (obj: any, keyRoute: string): any => {
  const keys = keyRoute.split(".");
  if (keys.length == 1) {
    return obj[keyRoute];
  } else {
    return getValByKey(obj[keys[0]], keyRoute.replace(`${keys[0]}.`, ""));
  }
};

/**
 * General template to display an array of arbitrary objects as a table that
 * is filterable and sortable. Optionally, the table can also be configured
 * to support to select an entry from it (props: selectedEntry and setSelectedEntry)
 *
 * The main table configuration is done via the array of `TableField` objects,
 * that are specified via the property `tableFields`. Each element of `tableFields`
 * is mapped to one column of the table.
 *
 * # Props:
 * * tableFields      - List of `TableField` objects to configure the columns of the table.
 * * collection       - List of objects that should be displayed via the table.
 * * selectedEntry    - (Optional) reference to the `Entry` object that is currently selected by the user.
 * * setCollection    - Function to set/update the collection list that should be displayed.
 * * setSelectedEntry - (Optional) function to specifiy, which entry from the table the user has currenty selected.
 */
const TableTemplate: React.FC<{
  tableFields: TableField[];
  collection: EntryTemplate[];
  selectedEntry?: EntryTemplate;
  setCollection: Function;
  setSelectedEntry?: Function;
}> = (props) => {

  // string that is applied to each entry to filter the entries of the displayed collection
  const [filter, setFilter] = useState<string>("");

  // object that will receive fields overtime to indicate the sort order of columns so that
  // the component knows to sort in the opposite direction every other sort request of a column
  const [sortOrderByField, setSortOrderByField] = useState<Object>({});

  // Callback function to sort a set of `Entry` objects by the specified field of the
  // objects.
  const byField = (field: string, asc: boolean) => {
    return (a: EntryTemplate, b: EntryTemplate) => {
      // number, bool
      let x = getValByKey(a, field);
      let y = getValByKey(b, field);
      // string
      if (typeof x === "string") {
        x = x.toLowerCase();
        y = y.toLowerCase();
      }

      // ascending
      if (asc) {
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
      } else {
        if (x < y) {
          return 1;
        }
        if (x > y) {
          return -1;
        }
      }

      // descending
      return 0;
    };
  };

  const sortByField = (field: string) => {
    let order = Object.hasOwn(sortOrderByField, field)
      ? sortOrderByField[field]
      : true;
    props.setCollection([...props.collection].sort(byField(field, order)));

    sortOrderByField[field] = !order;
    setSortOrderByField(sortOrderByField);
  };

  const applyFilter = (entry: EntryTemplate) => {
    let result = false;
    for (let i = 0; i < props.tableFields.length; i++) {
      const val = getValByKey(entry, props.tableFields[i].valueKey);
      if (typeof val === "number" || typeof val === "string") {
        if (val.toString().toLowerCase().includes(filter)) {
          result = true;
          break;
        }
      }
    }
    return result;
  };

  return (
    <div className="h-full w-full">
      <div>
        <input
          className="border-2 mb-2 border-gray-300 px-2 rounded-sm focus:border-none"
          onChange={(e) => setFilter(e.currentTarget.value)}
          placeholder="Filter"
        />
      </div>
      <div className="h-[85%] w-fit overflow-scroll">
        <table className="text-sm text-left border-2 border-slate-100 ">
          <thead className="sticky top-[0] bg-slate-200">
            <tr id="head">
              {props.tableFields.map((field) => (
                <th
                  id={`head-${field.label}`}
                  className="px-2 hover:border-b-2 border-black cursor-pointer"
                  onClick={() => {
                    sortByField(field.sortKey);
                  }}
                >
                  {field.icon ? <>{field.icon}</> : field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.collection
              .filter((entry) => applyFilter(entry))
              .map((entry) => (
                <tr
                  className={`cursor-pointer ${
                    props.selectedEntry && props.selectedEntry.id == entry.id
                      ? "bg-blue-100"
                      : "hover:bg-blue-50"
                  }`}
                  id={entry.id.toString()}
                  onClick={() => props.setSelectedEntry ? props.setSelectedEntry(entry) : ""}
                >
                  {props.tableFields.map((field) => (
                    <td className="px-2">
                      {field.icon ? (
                        getValByKey(entry, field.valueKey) ? (
                          <>{field.icon}</>
                        ) : (
                          ""
                        )
                      ) : (
                        getValByKey(entry, field.valueKey)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="py-4"></div>
    </div>
  );
};

export default TableTemplate;
