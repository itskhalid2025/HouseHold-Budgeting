import useIsMobile from "../hooks/useIsMobile";
import SavingsMobile from "./mobile/SavingsMobile";
import SavingsDesktop from "./desktop/SavingsDesktop";

export default function Savings() {
    const mobile = useIsMobile();
    return mobile ? <SavingsMobile /> : <SavingsDesktop />;
}
