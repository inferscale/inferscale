import type { InstanceType, RuntimeInfo } from "../../../types";

interface Props {
  runtime: RuntimeInfo;
  name: string;
  modelName: string;
  instanceType: string;
  instanceTypes: InstanceType[];
  replicas: number;
  args: string[];
  loggerEnabled: boolean;
  loggerMode: string;
  loggerDestination: string;
}

export default function ReviewStep({
  runtime,
  name,
  modelName,
  instanceType,
  instanceTypes,
  replicas,
  args,
  loggerEnabled,
  loggerMode,
  loggerDestination,
}: Props) {
  const itype = instanceTypes.find((t) => t.name === instanceType);

  return (
    <div>
      <p className="text-sm text-zinc-500 mb-4">
        Review your endpoint configuration before deploying.
      </p>

      <div className="bg-zinc-50 rounded-lg border border-border divide-y divide-border">
        <Row label="Endpoint" value={name} />
        <Row label="Model" value={modelName} />
        <Row label="Runtime" value={runtime.label} />
        <Row
          label="Instance"
          value={itype ? `${itype.name} (${itype.description})` : instanceType}
        />
        <Row label="Replicas" value={String(replicas)} />
        <Row
          label="Logging"
          value={
            loggerEnabled
              ? `${loggerMode} → ${loggerDestination}`
              : "Disabled"
          }
        />
      </div>

      {args.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-zinc-500 mb-2">Runtime arguments</p>
          <div className="bg-zinc-900 text-zinc-300 rounded-md p-3 font-mono text-xs space-y-0.5">
            {args.map((arg, i) => (
              <div key={i}>{arg}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-700">{value}</span>
    </div>
  );
}
