import geoip from 'geoip-lite';

/**
 * Resolve IP address to Country
 * @param {string} ip - IP address
 * @returns {string|null} - Country Code (e.g., 'US', 'IN') or null
 */
export const getCountryFromIp = (ip) => {
    if (!ip) return null;

    // Handle localhost/private IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return null;
    }

    const geo = geoip.lookup(ip);
    return geo ? geo.country : null;
};
