// this is the order we check the headers in for the client IP
// X-Client-IP
// X-Forwarded-For (Header may return multiple IP addresses in the format: "client IP, proxy 1 IP, proxy 2 IP", so we take the first one.)
// CF-Connecting-IP (Cloudflare)
// Fastly-Client-Ip (Fastly CDN and Firebase hosting header when forwared to a cloud function)
// True-Client-Ip (Akamai and Cloudflare)
// X-Real-IP (Nginx proxy/FastCGI)
// X-Cluster-Client-IP (Rackspace LB, Riverbed Stingray)
// X-Forwarded, Forwarded-For and Forwarded (Variations of #2)
// appengine-user-ip (Google App Engine)
// req.connection.remoteAddress
// req.socket.remoteAddress
// req.connection.socket.remoteAddress
// req.info.remoteAddress
// Cf-Pseudo-IPv4 (Cloudflare fallback)
// request.raw (Fastify)

import { headers } from 'next/headers';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

export async function getClientIP(): Promise<string | null> {
	const headersList = await headers();
	return getClientIpImproved(headersList, isValidIP);
}

export async function getClientIPv4(): Promise<string | null> {
	const headersList = await headers();
	return getClientIpImproved(headersList, isValidIPv4);
}

export async function getClientIPv6(): Promise<string | null> {
	const headersList = await headers();
	return getClientIpImproved(headersList, isValidIPv6);
}

// if we are using a cloudflare proxy we are in danger of getting spoofed so we need make sure to configure cloudflare to use only trusted proxies
export async function getClientIpImproved(
	headersList: ReadonlyHeaders,
	checkIPFunction: IPValidationFunction
): Promise<string | null> {
	const headers = {
		'x-forwarded-for': headersList.get('x-forwarded-for'),
		'x-client-ip': headersList.get('x-client-ip'),
		'cf-connecting-ip': headersList.get('cf-connecting-ip'),
		'fastly-client-ip': headersList.get('fastly-client-ip'),
		'true-client-ip': headersList.get('true-client-ip'),
		'x-real-ip': headersList.get('x-real-ip'),
		'x-cluster-client-ip': headersList.get('x-cluster-client-ip'),
		'x-forwarded': headersList.get('x-forwarded'),
		'forwarded-for': headersList.get('forwarded-for'),
		forwarded: headersList.get('forwarded'),
		'x-appengine-user-ip': headersList.get('x-appengine-user-ip'),
		'cf-pseudo-ipv4': headersList.get('cf-pseudo-ipv4'),
	};

	for (const [key, value] of Object.entries(headers)) {
		if (value && checkIPFunction(value)) {
			return value;
		}
		if (key === 'x-forwarded-for' && value) {
			const forwardedIp = getClientIpFromXForwardedFor(value, checkIPFunction);
			if (forwardedIp) {
				return forwardedIp;
			}
		}
	}

	return null;
}

async function getClientIpFromXForwardedFor(
	value: string,
	checkIPFunction: IPValidationFunction
): Promise<string | null> {
	if (!value) {
		return null;
	}

	if (typeof value !== 'string') {
		throw new TypeError(`Expected a string, got "${typeof value}"`);
	}

	const forwardedIps = value.split(',').map((e) => {
		const ip = e.trim();

		if (ip.includes(':')) {
			const splitted = ip.split(':');

			if (splitted.length === 2) {
				return splitted[0];
			}
		}

		return ip;
	});

	for (const ip of forwardedIps) {
		if (checkIPFunction(ip)) {
			return ip;
		}
	}
	return null;
}

const regexes = {
	ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
	ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
};

type IPValidationFunction = (ip: string) => boolean;

export const isValidIP: IPValidationFunction = (ip: string): boolean => {
	return ip !== null && (regexes.ipv4.test(ip) || regexes.ipv6.test(ip));
};

export const isValidIPv4: IPValidationFunction = (ip: string): boolean => {
	return ip !== null && regexes.ipv4.test(ip);
};

export const isValidIPv6: IPValidationFunction = (ip: string): boolean => {
	return ip !== null && regexes.ipv6.test(ip);
};
