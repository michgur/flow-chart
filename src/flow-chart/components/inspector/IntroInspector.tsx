import { UserCheckIcon } from "@phosphor-icons/react";
import { useNodesData, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

import { type FlowEdge, type IntroNode } from "../../flow-model";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";

type IntroField = Exclude<keyof IntroNode["data"], "metadataRest">;

const fields: {
  key: IntroField;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "agentName",
    label: "Agent Name",
    placeholder: "e.g. Amanda",
  },
  {
    key: "companyName",
    label: "Company Name",
    placeholder: "e.g. monday.com",
  },
  {
    key: "callIntro",
    label: "Outgoing Call Intro",
    placeholder: "Hi, this is {%agent_name%} from {%company_name%}",
  },
  {
    key: "inboundWelcome",
    label: "Incoming Call Intro",
    placeholder: "Hello, this is {%agent_name%} from {%company_name%}.",
  },
  {
    key: "voicemail",
    label: "Voicemail Message",
    placeholder:
      "Hi this is {%agent_name%} from {%company_name%}, please call me back at {%agent_phone_number%:local_phone:digits}",
  },
  {
    key: "speakerVerificationAcknowledge",
    label: "Right-Person Acknowledgement",
    placeholder: "Great!, Hi {contact_name}",
  },
];

export function IntroInspector({ id }: { id: string }) {
  const { updateNodeData } = useReactFlow<IntroNode, FlowEdge>();
  const node = useNodesData<IntroNode>(id);
  const data = node?.data;

  const [draft, setDraft] = useState<Pick<IntroNode["data"], IntroField>>({
    agentName: "",
    companyName: "",
    callIntro: "",
    inboundWelcome: "",
    voicemail: "",
    speakerVerificationAcknowledge: "",
  });

  useEffect(() => {
    if (!data) return;

    setDraft({
      agentName: data.agentName,
      companyName: data.companyName,
      callIntro: data.callIntro,
      inboundWelcome: data.inboundWelcome,
      voicemail: data.voicemail,
      speakerVerificationAcknowledge: data.speakerVerificationAcknowledge,
    });
  }, [data, id]);

  if (!data) return null;

  return (
    <section className="space-y-3 p-3 text-sm">
      <label htmlFor="intro-title" className="flex items-center gap-1 text-slate-700">
        <UserCheckIcon className="size-5" weight="duotone" />
        <span id="intro-title" className="text-base font-medium">
          Call Intro
        </span>
      </label>

      <p className="text-xs text-slate-500">
        Control what the agent says in specific scenarios, or leave blank to use the default
        behaviors.
      </p>

      {fields.map((field) => (
        <label key={field.key} className="flex cursor-text flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">{field.label}</span>
          <AutoResizeTextarea
            name={`intro-${field.key}`}
            value={draft[field.key]}
            onChange={(event) => {
              const value = event.target.value;
              setDraft((current) => ({ ...current, [field.key]: value }));
            }}
            onBlur={(event) => {
              const value = event.target.value;
              setDraft((current) => ({ ...current, [field.key]: value }));
              updateNodeData(id, { [field.key]: value });
            }}
            placeholder={field.placeholder}
            className="w-full resize-none overflow-hidden rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-none"
            spellCheck={true}
          />
        </label>
      ))}
    </section>
  );
}
