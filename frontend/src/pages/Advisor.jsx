import useIsMobile from "../hooks/useIsMobile";
import AdvisorMobile from "./mobile/AdvisorMobile";
import AdvisorDesktop from "./desktop/AdvisorDesktop";

export default function Advisor() {
    const mobile = useIsMobile();
    return mobile ? <AdvisorMobile /> : <AdvisorDesktop />;
}
