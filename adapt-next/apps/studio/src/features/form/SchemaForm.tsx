"use client";
import type { PropSchema, UiHint, WidgetKind } from "@adapt-next/content-schemas";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { RichTextField } from "./RichTextField";

type Value = Record<string, unknown>;

export function SchemaForm({
  schema,
  value,
  onChange,
}: {
  schema: PropSchema;
  value: Value;
  onChange: (next: Value) => void;
}) {
  const props = schema.properties ?? {};
  const general: string[] = [];
  const settings: string[] = [];
  for (const [key, field] of Object.entries(props)) {
    if (field["x-ui"]?.hidden) continue;
    if (field.isSetting) settings.push(key);
    else general.push(key);
  }

  const setField = (key: string, v: unknown) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-5">
      <Fieldset legend="General" keys={general} props={props} value={value} onField={setField} />
      <Fieldset legend="Settings" keys={settings} props={props} value={value} onField={setField} />
    </div>
  );
}

function Fieldset({
  legend,
  keys,
  props,
  value,
  onField,
}: {
  legend: string;
  keys: string[];
  props: Record<string, PropSchema>;
  value: Value;
  onField: (key: string, v: unknown) => void;
}) {
  if (keys.length === 0) return null;
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400">{legend}</legend>
      {keys.map((key) => (
        <Field
          key={key}
          name={key}
          schema={props[key] as PropSchema}
          value={value[key]}
          onChange={(v) => onField(key, v)}
        />
      ))}
    </fieldset>
  );
}

function Field({
  name,
  schema,
  value,
  onChange,
}: {
  name: string;
  schema: PropSchema;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const widget = resolveWidget(schema);
  const label = schema.title ?? titleCase(name);
  const help = schema["x-ui"]?.help;

  if (widget === "object") {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3">
        <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
        <ObjectFields
          schema={schema}
          value={(value as Value) ?? {}}
          onChange={(v) => onChange(v)}
        />
      </div>
    );
  }

  if (widget === "list") {
    return <ListField name={name} schema={schema} value={(value as unknown[]) ?? []} onChange={onChange} />;
  }

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <Widget widget={widget} schema={schema} value={value} onChange={onChange} ui={schema["x-ui"]} />
      {help ? <span className="mt-1 block text-xs text-slate-400">{help}</span> : null}
    </label>
  );
}

function ObjectFields({
  schema,
  value,
  onChange,
}: {
  schema: PropSchema;
  value: Value;
  onChange: (v: Value) => void;
}) {
  const props = schema.properties ?? {};
  return (
    <div className="space-y-3">
      {Object.entries(props).map(([key, child]) =>
        child["x-ui"]?.hidden ? null : (
          <Field
            key={key}
            name={key}
            schema={child}
            value={value[key]}
            onChange={(v) => onChange({ ...value, [key]: v })}
          />
        ),
      )}
    </div>
  );
}

function ListField({
  name,
  schema,
  value,
  onChange,
}: {
  name: string;
  schema: PropSchema;
  value: unknown[];
  onChange: (v: unknown[]) => void;
}) {
  const itemSchema = schema.items ?? { type: "string" };
  const label = schema.title ?? titleCase(name);
  const itemLabelKey = schema["x-ui"]?.itemLabel;

  const update = (i: number, v: unknown) => onChange(value.map((item, idx) => (idx === i ? v : item)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, deriveDefault(itemSchema)]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j] as unknown, next[i] as unknown];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <div className="space-y-2">
        {value.map((item, i) => {
          const summary =
            itemLabelKey && item && typeof item === "object"
              ? String((item as Value)[itemLabelKey] ?? "")
              : "";
          return (
            <div key={i} className="rounded-md border border-slate-200 bg-white p-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {label} {i + 1}
                  {summary ? ` — ${summary}` : ""}
                </span>
                <div className="flex items-center gap-1">
                  <IconBtn title="Move up" onClick={() => move(i, -1)}>
                    <ChevronUp size={14} />
                  </IconBtn>
                  <IconBtn title="Move down" onClick={() => move(i, 1)}>
                    <ChevronDown size={14} />
                  </IconBtn>
                  <IconBtn title="Remove" onClick={() => remove(i)}>
                    <Trash2 size={14} />
                  </IconBtn>
                </div>
              </div>
              {itemSchema.type === "object" ? (
                <ObjectFields schema={itemSchema} value={(item as Value) ?? {}} onChange={(v) => update(i, v)} />
              ) : (
                <Widget
                  widget={resolveWidget(itemSchema)}
                  schema={itemSchema}
                  value={item}
                  onChange={(v) => update(i, v)}
                  ui={itemSchema["x-ui"]}
                />
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 rounded-md border border-dashed border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
      >
        + Add {label.toLowerCase()}
      </button>
    </div>
  );
}

function Widget({
  widget,
  schema,
  value,
  onChange,
  ui,
}: {
  widget: WidgetKind;
  schema: PropSchema;
  value: unknown;
  onChange: (v: unknown) => void;
  ui?: UiHint;
}) {
  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none";

  switch (widget) {
    case "richtext":
      return <RichTextField value={(value as string) ?? ""} onChange={onChange} />;
    case "displayTitle":
      return <RichTextField value={(value as string) ?? ""} onChange={onChange} inline />;
    case "textarea":
    case "codeeditor":
      return (
        <textarea
          className={cn(inputClass, "min-h-[5rem] font-mono")}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className={inputClass}
          value={value === undefined || value === null ? "" : (value as number)}
          min={schema.minimum}
          max={schema.maximum}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );
    case "boolean":
      return (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case "select": {
      const options: { value: string | number | boolean; label?: string }[] =
        ui?.options ?? (schema.enum ?? []).map((v) => ({ value: v }));
      return (
        <select className={inputClass} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label ?? String(opt.value)}
            </option>
          ))}
        </select>
      );
    }
    case "asset":
      return (
        <input
          type="text"
          className={inputClass}
          placeholder="Asset URL"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "tags":
      return (
        <input
          type="text"
          className={inputClass}
          placeholder="Comma-separated"
          value={Array.isArray(value) ? (value as string[]).join(", ") : ""}
          onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
        />
      );
    case "text":
    default:
      return (
        <input
          type="text"
          className={inputClass}
          value={(value as string) ?? ""}
          placeholder={ui?.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    >
      {children}
    </button>
  );
}

export function resolveWidget(schema: PropSchema): WidgetKind {
  const hinted = schema["x-ui"]?.widget;
  if (hinted) return hinted;
  if (schema.type === "array") return "list";
  if (schema.type === "object") return "object";
  if (schema.type === "boolean") return "boolean";
  if (schema.type === "number" || schema.type === "integer") return "number";
  if (schema.enum) return "select";
  return "text";
}

function deriveDefault(schema: PropSchema): unknown {
  if (schema.default !== undefined) return schema.default;
  if (schema.type === "object") {
    const obj: Value = {};
    for (const [key, child] of Object.entries(schema.properties ?? {})) obj[key] = deriveDefault(child);
    return obj;
  }
  if (schema.type === "array") return [];
  if (schema.type === "boolean") return false;
  if (schema.type === "number" || schema.type === "integer") return 0;
  return "";
}

function titleCase(key: string): string {
  return key
    .replace(/^_/, "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}
