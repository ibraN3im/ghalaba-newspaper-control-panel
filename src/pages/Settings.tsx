import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { apiService } from "../services/api";
import type { Settings } from "../services/api";
import { Save } from "lucide-react";

export function Settings() {
    const { language, t } = useLanguage();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await apiService.getSettings();
            setSettings(data || null);
            setError("");
        } catch (err) {
            setError(t("فشل تحميل الإعدادات", "Failed to load settings"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;

        console.log('Saving settings:', settings);

        try {
            const savedSettings = await apiService.updateSettings(settings);
            console.log('Settings saved successfully:', savedSettings);

            // Update local state with saved settings
            setSettings(savedSettings);

            setSuccess(t("تم حفظ الإعدادات بنجاح", "Settings saved successfully"));
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error('Failed to save settings:', err);
            setError(t("فشل حفظ الإعدادات", "Failed to save settings"));
        }
    };

    const updateSetting = (field: string, value: any) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: value });
    };

    const updateNestedSetting = (parent: string, field: string, value: any) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [parent]: {
                ...(settings as any)[parent],
                [field]: value
            }
        });
    };

    if (loading) {
        return (
            <div className="p-8 text-center">{t("جاري التحميل...", "Loading...")}</div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{t("إعدادات الموقع", "Site Settings")}</h1>
                <p className="text-gray-600 text-sm sm:text-base">{t("تكوين وإدارة إعدادات الموقع", "Configure and manage site settings")}</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Settings */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">{t("الإعدادات العامة", "General Settings")}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("اسم الموقع (عربي)", "Site Name (Arabic)")}
                            </label>
                            <input
                                type="text"
                                value={settings?.siteName.ar || ''}
                                onChange={(e) => updateNestedSetting('siteName', 'ar', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("اسم الموقع (إنجليزي)", "Site Name (English)")}
                            </label>
                            <input
                                type="text"
                                value={settings?.siteName.en || ''}
                                onChange={(e) => updateNestedSetting('siteName', 'en', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("رابط الشعار", "Logo URL")}
                        </label>
                        <input
                            type="url"
                            value={settings?.logo || ''}
                            onChange={(e) => updateSetting('logo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            dir="ltr"
                        />
                    </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">{t("إعدادات العرض", "Display Settings")}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("عدد المقالات في الصفحة", "Articles per Page")}
                            </label>
                            <input
                                type="number"
                                value={settings?.articlesPerPage || 10}
                                onChange={(e) => updateSetting('articlesPerPage', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">


                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showBreakingTicker"
                                checked={settings?.showBreakingTicker !== false}
                                onChange={(e) => updateSetting('showBreakingTicker', e.target.checked)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <label htmlFor="showBreakingTicker" className="text-sm font-medium text-gray-700">
                                {t("إظهار شريط الأخبار العاجلة", "Show Breaking News Ticker")}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-red-600 text-white text-sm sm:text-base md:text-lg p-4 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {t("حفظ الإعدادات", "Save Settings")}
                    </button>
                </div>
            </form>
        </div>
    );
}
