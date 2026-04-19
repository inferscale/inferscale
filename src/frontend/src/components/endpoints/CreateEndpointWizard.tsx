import { useEffect, useMemo, useState } from "react";
import {
  useCreateEndpoint,
  useInstanceTypes,
  useRuntimeCatalog,
} from "../../hooks/useQueries";
import type { MLModel } from "../../types";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import StepIndicator from "./StepIndicator";
import CategoryStep from "./steps/CategoryStep";
import ConfigStep from "./steps/ConfigStep";
import ReviewStep from "./steps/ReviewStep";
import RuntimeStep from "./steps/RuntimeStep";

interface Props {
  model: MLModel;
  onClose: () => void;
}

const STEPS = [
  { label: "Type" },
  { label: "Runtime" },
  { label: "Configuration" },
  { label: "Review" },
];

function generateEndpointName(modelName: string): string {
  const slug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${slug}-endpoint-${suffix}`;
}

function parseArgs(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export default function CreateEndpointWizard({ model, onClose }: Props) {
  const { data: catalog } = useRuntimeCatalog();
  const { data: instanceTypes = [] } = useInstanceTypes();
  const mutation = useCreateEndpoint();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [runtimeName, setRuntimeName] = useState("");
  const [name, setName] = useState("");
  const [instanceType, setInstanceType] = useState("");
  const [replicas, setReplicas] = useState(1);
  const [argsText, setArgsText] = useState("");
  const [loggerEnabled, setLoggerEnabled] = useState(false);
  const [loggerMode, setLoggerMode] = useState("all");
  const [loggerDestination, setLoggerDestination] = useState("kafka");

  const categories = useMemo(() => catalog?.categories ?? [], [catalog]);
  const allRuntimes = useMemo(() => catalog?.items ?? [], [catalog]);
  const filteredRuntimes = useMemo(
    () => allRuntimes.filter((r) => r.category === category),
    [allRuntimes, category],
  );
  const selectedRuntime = allRuntimes.find((r) => r.name === runtimeName);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  useEffect(() => {
    if (!name) setName(generateEndpointName(model.name));
  }, [model.name, name]);

  useEffect(() => {
    if (instanceTypes.length > 0 && !instanceType) {
      setInstanceType(instanceTypes[0].name);
    }
  }, [instanceTypes, instanceType]);

  useEffect(() => {
    setRuntimeName("");
    setArgsText("");
  }, [category]);

  const handleDeploy = () => {
    mutation.mutate(
      {
        model_id: model.id,
        name,
        runtime: runtimeName,
        instance_type: instanceType,
        replicas,
        args: parseArgs(argsText),
        logger_enabled: loggerEnabled,
        logger_mode: loggerMode,
        logger_destination: loggerDestination,
      },
      { onSuccess: onClose },
    );
  };

  const canNext = () => {
    switch (step) {
      case 0: return !!category;
      case 1: return !!runtimeName;
      case 2: return !!name.trim() && !!instanceType;
      case 3: return true;
      default: return false;
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <Modal title="Deploy Endpoint" onClose={onClose} maxWidth="lg">
      <p className="text-xs text-zinc-500 mb-4">
        Model:{" "}
        <span className="text-zinc-700 font-medium">{model.name}</span>
      </p>

      <StepIndicator steps={STEPS} current={step} />

      {step === 0 && (
        <CategoryStep
          categories={categories}
          value={category}
          onChange={setCategory}
        />
      )}

      {step === 1 && (
        <RuntimeStep
          runtimes={filteredRuntimes}
          value={runtimeName}
          onChange={setRuntimeName}
        />
      )}

      {step === 2 && (
        <ConfigStep
          instanceTypes={instanceTypes}
          name={name}
          instanceType={instanceType}
          replicas={replicas}
          argsText={argsText}
          onNameChange={setName}
          onInstanceTypeChange={setInstanceType}
          onReplicasChange={setReplicas}
          onArgsTextChange={setArgsText}
          loggerEnabled={loggerEnabled}
          loggerMode={loggerMode}
          loggerDestination={loggerDestination}
          onLoggerEnabledChange={setLoggerEnabled}
          onLoggerModeChange={setLoggerMode}
          onLoggerDestinationChange={setLoggerDestination}
        />
      )}

      {step === 3 && selectedRuntime && (
        <ReviewStep
          runtime={selectedRuntime}
          name={name}
          modelName={model.name}
          instanceType={instanceType}
          instanceTypes={instanceTypes}
          replicas={replicas}
          args={parseArgs(argsText)}
          loggerEnabled={loggerEnabled}
          loggerMode={loggerMode}
          loggerDestination={loggerDestination}
        />
      )}

      {mutation.isError && (
        <p className="text-xs text-red-500 mt-4">
          Failed to create endpoint. Please try again.
        </p>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-border">
        <div>
          {step > 0 && (
            <Button variant="ghost" type="button" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>

          {isLast ? (
            <Button
              variant="primary"
              type="button"
              disabled={!canNext()}
              loading={mutation.isPending}
              onClick={handleDeploy}
              className="px-5"
            >
              {mutation.isPending ? "Deploying..." : "Deploy"}
            </Button>
          ) : (
            <Button
              variant="primary"
              type="button"
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
              className="px-5"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
