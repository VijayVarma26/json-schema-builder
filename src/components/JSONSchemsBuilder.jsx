import React, { useState } from "react";
import FieldEditor, { defaultField } from "./FieldEditor";
import { Button } from "./ui/button";

export default function JSONSchemaBuilder() {
  const [fields, setFields] = useState([{ ...defaultField() }]);
  const [pasteSchema, setPasteSchema] = useState("");

  const updateFieldAtPath = (path, updatedField) => {
    const newFields = [...fields];
    let current = newFields;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].children;
    }
    current[path[path.length - 1]] = updatedField;
    setFields(newFields);
  };

  const removeFieldAtPath = (path) => {
    const newFields = [...fields];
    let current = newFields;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].children;
    }
    current.splice(path[path.length - 1], 1);
    setFields(newFields);
  };

  const addField = () => {
    setFields([...fields, { ...defaultField() }]);
  };

  const buildValueFromFields = (fieldList) => {
    const obj = {};

    fieldList.forEach((field) => {
      if (!field.name || field.name.trim() === "") return;

      let value;
      if (field.type === "object") {
        value = buildValueFromFields(field.children);
      } else if (field.type === "array_object") {
        value = field.children.map((child) => buildValueFromFields(child.children));
      } else if (field.type === "array") {
        value = field.children.map((child) => child.value);
      } else if (field.type === "number") {
        value = parseFloat(field.value) || 0;
      } else if (field.type === "boolean") {
        value = field.value === "true" || field.value === true;
      } else {
        value = field.value || "";
      }

      obj[field.name] = value;
    });

    return obj;
  };

  const generateSchema = () => {
    return JSON.stringify(buildValueFromFields(fields), null, 2);
  };

  const downloadSchema = () => {
    const blob = new Blob([generateSchema()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePasteSchema = () => {
    try {
      const parsedSchema = JSON.parse(pasteSchema);

      const createFieldStructure = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map((item) => createFieldStructure(item));
        } else if (obj && typeof obj === "object") {
          return Object.entries(obj).map(([key, value]) => {
            let type = typeof value;
            let children = [];

            if (Array.isArray(value)) {
              type = "array";
              children = value.map((v) =>
                typeof v === "object" && v !== null
                  ? {
                      name: "",
                      type: "object",
                      value: "",
                      required: false,
                      children: createFieldStructure(v),
                    }
                  : {
                      name: "",
                      type: typeof v,
                      value: v,
                      required: false,
                      children: [],
                    }
              );
            } else if (value && typeof value === "object") {
              type = "object";
              children = createFieldStructure(value);
            }

            return {
              name: key,
              type,
              value: typeof value !== "object" ? value : "",
              required: false,
              children,
            };
          });
        }
        return [];
      };

      setFields(createFieldStructure(parsedSchema));
    } catch (error) {
      alert("Invalid JSON Schema");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">JSON Schema Builder</h1>
      <textarea
        className="border p-2 rounded w-full"
        rows="6"
        placeholder="Paste an existing JSON schema here..."
        value={pasteSchema}
        onChange={(e) => setPasteSchema(e.target.value)}
      />
      <Button onClick={handlePasteSchema} className="mt-2">
        Populate from JSON
      </Button>

      {fields.map((field, index) => (
        <FieldEditor
          key={index}
          field={field}
          path={[index]}
          updateFieldAtPath={updateFieldAtPath}
          removeFieldAtPath={removeFieldAtPath}
        />
      ))}

      <Button onClick={addField}>Add Field</Button>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Generated JSON Example</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto">{generateSchema()}</pre>
        <Button onClick={downloadSchema} className="mt-2">Download JSON</Button>
      </div>
    </div>
  );
}
