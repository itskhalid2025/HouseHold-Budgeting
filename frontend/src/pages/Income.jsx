import useIsMobile from "../hooks/useIsMobile";
import IncomeMobile from "./mobile/IncomeMobile";
import IncomeDesktop from "./desktop/IncomeDesktop";

export default function Income() {
    const mobile = useIsMobile();
    return mobile ? <IncomeMobile /> : <IncomeDesktop />;
}
