import useIsMobile from "../hooks/useIsMobile";
import HouseholdMobile from "./mobile/HouseholdMobile";
import HouseholdDesktop from "./desktop/HouseholdDesktop";

export default function Household() {
    const mobile = useIsMobile();
    return mobile ? <HouseholdMobile /> : <HouseholdDesktop />;
}
