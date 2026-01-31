import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

const useIsMobile = () => {
    const [mobile, setMobile] = useState(isMobile || window.innerWidth < 768);

    useEffect(() => {
        const handler = () => {
            setMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    return mobile;
};

export default useIsMobile;
