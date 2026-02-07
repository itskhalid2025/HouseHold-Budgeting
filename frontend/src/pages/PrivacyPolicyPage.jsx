import useIsMobile from '../hooks/useIsMobile';
import PrivacyPolicyDesktop from './desktop/PrivacyPolicyDesktop';
import PrivacyPolicyMobile from './mobile/PrivacyPolicyMobile';

function PrivacyPolicyPage() {
    const isMobile = useIsMobile();

    return isMobile ? <PrivacyPolicyMobile /> : <PrivacyPolicyDesktop />;
}

export default PrivacyPolicyPage;
