import useIsMobile from '../hooks/useIsMobile';
import LandingDesktop from './desktop/LandingDesktop';
import LandingMobile from './mobile/LandingMobile';

function LandingPage() {
    const isMobile = useIsMobile();

    return isMobile ? <LandingMobile /> : <LandingDesktop />;
}

export default LandingPage;
