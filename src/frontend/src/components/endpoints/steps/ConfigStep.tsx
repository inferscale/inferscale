import type { InstanceType } from "../../../types";
import InstanceTypeSelector from "../../InstanceTypeSelector";
import { FormInput, FormLabel, FormTextarea } from "../../ui/FormField";

const LOGGER_MODES = [
  { name: "all", label: "All", description: "Log both request and response" },
  { name: "request", label: "Request", description: "Log only request" },
  { name: "response", label: "Response", description: "Log only response" },
];

const LOGGER_DESTINATIONS = [
  { name: "kafka", label: "Kafka" },
  { name: "s3", label: "S3" },
];

interface Props {
  instanceTypes: InstanceType[];
  name: string;
  instanceType: string;
  replicas: number;
  argsText: string;
  onNameChange: (v: string) => void;
  onInstanceTypeChange: (v: string) => void;
  onReplicasChange: (v: number) => void;
  onArgsTextChange: (v: string) => void;
  loggerEnabled: boolean;
  loggerMode: string;
  loggerDestination: string;
  onLoggerEnabledChange: (v: boolean) => void;
  onLoggerModeChange: (v: string) => void;
  onLoggerDestinationChange: (v: string) => void;
}

export default function ConfigStep({
  instanceTypes,
  name,
  instanceType,
  replicas,
  argsText,
  onNameChange,
  onInstanceTypeChange,
  onReplicasChange,
  onArgsTextChange,
  loggerEnabled,
  loggerMode,
  loggerDestination,
  onLoggerEnabledChange,
  onLoggerModeChange,
  onLoggerDestinationChange,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <FormLabel>Endpoint Name</FormLabel>
        <FormInput
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <InstanceTypeSelector
        instanceTypes={instanceTypes}
        value={instanceType}
        onChange={onInstanceTypeChange}
      />

      <div>
        <FormLabel>Replicas</FormLabel>
        <FormInput
          type="number"
          min={1}
          max={10}
          value={replicas}
          onChange={(e) => onReplicasChange(Number(e.target.value))}
        />
      </div>

      <div>
        <FormLabel>Runtime Arguments</FormLabel>
        <FormTextarea
          value={argsText}
          onChange={(e) => onArgsTextChange(e.target.value)}
          rows={5}
          placeholder={"--task=text_generation\n--backend=vllm\n--max-model-len=4096"}
          className="font-mono text-xs"
        />
        <p className="text-xs text-zinc-400 mt-1">
          One argument per line, e.g. --key=value
        </p>
      </div>

      <div className="border-t border-border pt-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <FormLabel>Inference Logging</FormLabel>
            <p className="text-xs text-zinc-400">
              Log inference requests and responses for monitoring and debugging
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={loggerEnabled}
            onClick={() => onLoggerEnabledChange(!loggerEnabled)}
            className={`
              relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full
              transition-colors duration-200
              ${loggerEnabled ? "bg-accent" : "bg-zinc-300"}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-4 w-4 rounded-full bg-white
                shadow-sm transform transition-transform duration-200 mt-0.5
                ${loggerEnabled ? "translate-x-4 ml-0.5" : "translate-x-0 ml-0.5"}
              `}
            />
          </button>
        </div>

        {loggerEnabled && (
          <div className="space-y-4 pl-0">
            <div>
              <FormLabel>Mode</FormLabel>
              <div className="flex gap-2">
                {LOGGER_MODES.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => onLoggerModeChange(m.name)}
                    className={`
                      px-3 py-1.5 rounded-md text-xs font-medium border transition-colors
                      ${loggerMode === m.name
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border text-zinc-500 hover:border-zinc-300"
                      }
                    `}
                    title={m.description}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FormLabel>Destination</FormLabel>
              <div className="flex gap-2">
                {LOGGER_DESTINATIONS.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => onLoggerDestinationChange(d.name)}
                    className={`
                      px-3 py-1.5 rounded-md text-xs font-medium border transition-colors
                      ${loggerDestination === d.name
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border text-zinc-500 hover:border-zinc-300"
                      }
                    `}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
