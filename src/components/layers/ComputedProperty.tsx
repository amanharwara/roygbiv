import { Layer, isComputedProperty, useLayerStore } from "../../stores/layers";
import TextField from "../ui/TextField";

function ComputedProperty({
  id,
  name,
  layer,
}: {
  id: string;
  name: string;
  layer: Layer;
}) {
  const property = layer[id as keyof Layer];

  const updatePropertyValue = useLayerStore(
    (state) => state.updateLayerComputedProperty,
  );

  if (!isComputedProperty(property)) {
    return null;
  }

  return (
    <TextField
      label={
        <>
          <span>{name}:</span>{" "}
          <span className="opacity-50">
            ({property.min} - {property.max})
          </span>
        </>
      }
      className="w-full"
      value={property.value}
      onChange={(value) => {
        updatePropertyValue(layer.id, id, value);
      }}
    />
  );
}

export default ComputedProperty;
