import useIsMobile from "../hooks/useIsMobile";
import ReportsMobile from "./mobile/ReportsMobile";
import ReportsDesktop from "./desktop/ReportsDesktop";

export default function Reports() {
    const mobile = useIsMobile();
    return mobile ? <ReportsMobile /> : <ReportsDesktop />;
}
