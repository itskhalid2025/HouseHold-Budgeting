import useIsMobile from "../hooks/useIsMobile";
import SettingsMobile from "./mobile/SettingsMobile";
import SettingsDesktop from "./desktop/SettingsDesktop";

export default function Settings() {
    const mobile = useIsMobile();
    return mobile ? <SettingsMobile /> : <SettingsDesktop />;
}
