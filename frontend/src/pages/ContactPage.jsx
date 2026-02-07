import useIsMobile from '../hooks/useIsMobile';
import ContactDesktop from './desktop/ContactDesktop';
import ContactMobile from './mobile/ContactMobile';

function ContactPage() {
    const isMobile = useIsMobile();

    return isMobile ? <ContactMobile /> : <ContactDesktop />;
}

export default ContactPage;
