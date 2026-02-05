import useIsMobile from '../hooks/useIsMobile';
import TermsOfServiceDesktop from './desktop/TermsOfServiceDesktop';
import TermsOfServiceMobile from './mobile/TermsOfServiceMobile';

function TermsOfServicePage() {
    const isMobile = useIsMobile();

    return isMobile ? <TermsOfServiceMobile /> : <TermsOfServiceDesktop />;
}

export default TermsOfServicePage;
