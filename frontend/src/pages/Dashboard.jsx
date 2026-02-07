import useIsMobile from "../hooks/useIsMobile";
import DashboardMobile from "./mobile/DashboardMobile";
import DashboardDesktop from "./desktop/DashboardDesktop";

export default function Dashboard() {
    const mobile = useIsMobile();
    return mobile ? <DashboardMobile /> : <DashboardDesktop />;
}
