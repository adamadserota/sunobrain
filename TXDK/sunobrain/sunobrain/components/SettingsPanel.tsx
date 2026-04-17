import type { Provider } from "../types";
import { GEMINI_MODELS, DEEPSEEK_MODELS, PROVIDER_LABEL } from "../types";

interface SettingsPanelProps {
    provider: Provider;
    model: string;
    onProviderChange: (provider: Provider) => void;
    onModelChange: (model: string) => void;
    onClose: () => void;
}

export function SettingsPanel({
    provider,
    model,
    onProviderChange,
    onModelChange,
    onClose,
}: SettingsPanelProps) {
    const modelOptions = provider === "deepseek" ? DEEPSEEK_MODELS : GEMINI_MODELS;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-end p-16 pr-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="card-osint w-[360px] p-6 flex flex-col gap-5 shadow-2xl rounded-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-sm font-bold uppercase tracking-widest text-intel-primary-400">
                    Settings
                </h2>

                <div className="flex flex-col gap-2">
                    <label className="label-osint">Provider</label>
                    <select
                        value={provider}
                        onChange={(e) => onProviderChange(e.target.value as Provider)}
                        className="input-osint text-sm cursor-pointer"
                    >
                        <option value="gemini">{PROVIDER_LABEL.gemini}</option>
                        <option value="deepseek">{PROVIDER_LABEL.deepseek}</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="label-osint">Model</label>
                    <select
                        value={model}
                        onChange={(e) => onModelChange(e.target.value)}
                        className="input-osint text-sm cursor-pointer"
                    >
                        {modelOptions.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                    API keys are configured on the server via environment variables. No key entry needed.
                </p>
            </div>
        </div>
    );
}
