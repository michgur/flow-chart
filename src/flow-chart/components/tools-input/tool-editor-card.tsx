import { TrashIcon } from "@phosphor-icons/react";

import type { ToolConfig } from "../../data-model";
import { AutoResizeTextarea } from "../ui/AutoResizeTextarea";
import { Switch } from "../ui/Switch";
import { JsonFallbackInput } from "./json-fallback-input";
import { NewCallToolInput } from "./new-call-tool-input";
import { ToolParametersInput } from "./tool-parameters-input";
import { ToolValuesInput } from "./tool-values-input";
import { normalizeNewCallConfig, normalizeParameters, WEBHOOK_METHODS } from "./tools-input-utils";

type ToolEditorCardProps = {
  tool: ToolConfig;
  onChange: (tool: ToolConfig) => void;
  onRemove: () => void;
};

export function ToolEditorCard({ tool, onChange, onRemove }: ToolEditorCardProps) {
  const parameters = normalizeParameters(tool.parameters);
  const fulfillment = tool.fulfillment ?? {};
  const webhook = fulfillment.webhook;

  const updateTool = (patch: Partial<ToolConfig>) => onChange({ ...tool, ...patch });

  const setWebhookEnabled = (enabled: boolean) => {
    updateTool({
      fulfillment: {
        ...fulfillment,
        webhook: enabled
          ? (fulfillment.webhook ?? {
              url: "",
              method: "POST",
            })
          : undefined,
      },
    });
  };

  const setTextMessageEnabled = (enabled: boolean) => {
    updateTool({
      fulfillment: {
        ...fulfillment,
        text_message: enabled ? (fulfillment.text_message ?? { message: "" }) : undefined,
      },
    });
  };

  const setHangupEnabled = (enabled: boolean) => {
    updateTool({
      fulfillment: {
        ...fulfillment,
        voice_action: enabled ? "hang_up" : undefined,
      },
    });
  };

  const setNewCallEnabled = (enabled: boolean) => {
    updateTool({
      fulfillment: {
        ...fulfillment,
        new_call: enabled ? normalizeNewCallConfig(fulfillment.new_call) : undefined,
      },
    });
  };

  const setValuesEnabled = (enabled: boolean) => {
    updateTool({
      fulfillment: {
        ...fulfillment,
        values: enabled ? (fulfillment.values ?? {}) : undefined,
      },
    });
  };

  return (
    <div className="space-y-3 rounded-sm bg-slate-100 p-2 outline-emerald-500 focus-within:bg-slate-50 focus-within:outline-2">
      <div className="flex items-center gap-2">
        <input
          value={tool.name}
          onChange={(event) => updateTool({ name: event.target.value })}
          onBlur={(event) =>
            updateTool({ name: event.target.value.trim().replace(/\s{2,}/g, " ") })
          }
          placeholder="Tool name"
          className="min-w-0 flex-1 rounded-sm bg-white/70 px-2 py-1.5 font-medium text-slate-900 outline-emerald-500 focus:outline-2"
        />

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${tool.name || "tool"}`}
          className="cursor-pointer rounded-sm p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-700"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>

      <Switch
        label="Enabled"
        value={tool.enabled ?? true}
        onChange={(enabled) => updateTool({ enabled })}
        className="-mx-2 px-2 font-medium"
      />

      <label className="block cursor-text space-y-1">
        <span className="font-medium text-slate-700 select-none">Description</span>
        <AutoResizeTextarea
          name="tool-description"
          value={tool.description}
          onChange={(event) => updateTool({ description: event.target.value })}
          placeholder="When should the agent call this tool?"
          className="w-full resize-none overflow-hidden rounded-sm bg-white/70 px-2 py-1.5 text-slate-900 outline-emerald-500 placeholder:text-slate-400 focus:bg-white focus:outline-2"
          spellCheck={true}
        />
      </label>

      <div className="space-y-2">
        <span className="block font-medium text-slate-700 select-none">Parameters</span>
        <ToolParametersInput
          value={parameters}
          onChange={(next) => updateTool({ parameters: next })}
        />
      </div>

      <div className="space-y-2">
        <span className="block font-medium text-slate-700 select-none">Fulfillment</span>

        <Switch
          label="Webhook"
          value={Boolean(webhook)}
          onChange={setWebhookEnabled}
          className="-mx-2 px-2"
        />
        {webhook && (
          <div className="space-y-2 rounded-sm border border-slate-200 bg-white/70 p-2">
            <label className="block space-y-1">
              <span className="font-medium text-slate-700">URL</span>
              <input
                value={webhook.url}
                onChange={(event) =>
                  updateTool({
                    fulfillment: {
                      ...fulfillment,
                      webhook: {
                        url: event.target.value,
                        method: webhook.method,
                        mapping: webhook.mapping,
                      },
                    },
                  })
                }
                placeholder="https://example.com/webhook"
                className="w-full rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 focus:bg-slate-50 focus:outline-2"
              />
            </label>

            <label className="block space-y-1">
              <span className="font-medium text-slate-700">Method</span>
              <select
                value={webhook.method}
                onChange={(event) =>
                  updateTool({
                    fulfillment: {
                      ...fulfillment,
                      webhook: {
                        url: webhook.url,
                        method: event.target.value,
                        mapping: webhook.mapping,
                      },
                    },
                  })
                }
                className="w-full rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 focus:bg-slate-50 focus:outline-2"
              >
                {WEBHOOK_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-1">
              <span className="block font-medium text-slate-700">Mapping</span>
              <ToolValuesInput
                value={webhook.mapping}
                onChange={(mapping) =>
                  updateTool({
                    fulfillment: {
                      ...fulfillment,
                      webhook: {
                        url: webhook.url,
                        method: webhook.method,
                        mapping,
                      },
                    },
                  })
                }
              />
              <JsonFallbackInput
                title="Webhook mapping JSON"
                value={webhook.mapping ?? {}}
                onChange={(mapping) =>
                  updateTool({
                    fulfillment: {
                      ...fulfillment,
                      webhook: {
                        url: webhook.url,
                        method: webhook.method,
                        mapping,
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        )}

        <Switch
          label="Text message"
          value={Boolean(fulfillment.text_message)}
          onChange={setTextMessageEnabled}
          className="-mx-2 px-2"
        />
        {fulfillment.text_message && (
          <label className="block cursor-text space-y-1 rounded-sm border border-slate-200 bg-white/70 p-2">
            <span className="font-medium text-slate-700 select-none">Message</span>
            <AutoResizeTextarea
              name="tool-text-message"
              value={fulfillment.text_message.message}
              onChange={(event) =>
                updateTool({
                  fulfillment: {
                    ...fulfillment,
                    text_message: {
                      ...fulfillment.text_message,
                      message: event.target.value,
                    },
                  },
                })
              }
              placeholder="Message to send"
              className="w-full resize-none overflow-hidden rounded-sm bg-slate-100 px-2 py-1.5 text-slate-900 outline-emerald-500 placeholder:text-slate-400 focus:bg-slate-50 focus:outline-2"
              spellCheck={true}
            />
          </label>
        )}

        <Switch
          label="Hang up call"
          value={fulfillment.voice_action === "hang_up"}
          onChange={setHangupEnabled}
          className="-mx-2 px-2"
        />

        <Switch
          label="Create new call"
          value={Boolean(fulfillment.new_call)}
          onChange={setNewCallEnabled}
          className="-mx-2 px-2"
        />
        {fulfillment.new_call && (
          <NewCallToolInput
            value={fulfillment.new_call}
            onChange={(newCall) =>
              updateTool({
                fulfillment: {
                  ...fulfillment,
                  new_call: newCall,
                },
              })
            }
          />
        )}

        <Switch
          label="Update call state"
          value={Boolean(fulfillment.values)}
          onChange={setValuesEnabled}
          className="-mx-2 px-2"
        />
        {fulfillment.values && (
          <div className="space-y-2 rounded-sm border border-slate-200 bg-white/70 p-2">
            <ToolValuesInput
              value={fulfillment.values}
              onChange={(values) =>
                updateTool({
                  fulfillment: {
                    ...fulfillment,
                    values,
                  },
                })
              }
            />
            <JsonFallbackInput
              title="Call state JSON"
              value={fulfillment.values}
              onChange={(values) =>
                updateTool({
                  fulfillment: {
                    ...fulfillment,
                    values,
                  },
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
