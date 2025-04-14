import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const defaultField = () => ({
  name: "",
  type: "string",
  required: false,
  value: "",
  children: [],
});

const FieldEditor = ({ field, path, updateFieldAtPath, removeFieldAtPath }) => {
  const handleFieldChange = (key, value) => {
    updateFieldAtPath(path, { ...field, [key]: value });
  };

  const addChildField = () => {
    handleFieldChange("children", [...field.children, { ...defaultField() }]);
  };

  const removeChild = (index) => {
    const newChildren = field.children.filter((_, i) => i !== index);
    handleFieldChange("children", newChildren);
  };

  return (
    <Card className="p-4 space-y-2">
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <input
          type="text"
          placeholder="Field name"
          value={field.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          className="border p-2 rounded w-full"
        />
        <select
          value={field.type}
          onChange={(e) => handleFieldChange("type", e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="object">object</option>
          <option value="array">array</option>
          <option value="array_object">array[objects]</option>
        </select>
        <input
          type="text"
          placeholder="Value"
          value={field.value}
          onChange={(e) => handleFieldChange("value", e.target.value)}
          className="border p-2 rounded w-full"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => handleFieldChange("required", e.target.checked)}
          />
          <span>Required</span>
        </label>
        <Button onClick={() => removeFieldAtPath(path)} variant="destructive">
          Remove
        </Button>
      </CardContent>

      {(field.type === "object" || field.type === "array" || field.type === "array_object") && (
        <div className="ml-4">
          <h3 className="font-medium">
            {field.type === "array" || field.type === "array_object" ? "Item Schema" : "Nested Fields"}
          </h3>
          {field.children.map((child, index) => (
            <FieldEditor
              key={index}
              field={child}
              path={[...path, index]}
              updateFieldAtPath={updateFieldAtPath}
              removeFieldAtPath={removeChild}
            />
          ))}
          <Button onClick={addChildField} className="mt-2">
            Add {field.type === "array" || field.type === "array_object" ? "Item Field" : "Nested Field"}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FieldEditor;
export { defaultField };
