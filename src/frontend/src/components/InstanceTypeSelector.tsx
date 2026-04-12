import type { InstanceType } from "../types";
import CustomSelect, { type SelectOption } from "./ui/CustomSelect";

interface Props {
  instanceTypes: InstanceType[];
  value: string;
  onChange: (name: string) => void;
}

export default function InstanceTypeSelector({
  instanceTypes,
  value,
  onChange,
}: Props) {
  const options: SelectOption[] = instanceTypes.map((it) => ({
    value: it.name,
    label: it.name,
    description: it.description,
  }));

  return (
    <CustomSelect
      label="Instance Type"
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select instance…"
    />
  );
}
