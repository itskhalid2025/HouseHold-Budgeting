import useIsMobile from '../hooks/useIsMobile';
import FeaturesDesktop from './desktop/FeaturesDesktop';
import FeaturesMobile from './mobile/FeaturesMobile';

function FeaturesPage() {
    const isMobile = useIsMobile();

    return isMobile ? <FeaturesMobile /> : <FeaturesDesktop />;
}

export default FeaturesPage;
