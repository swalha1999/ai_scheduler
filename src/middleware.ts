import createMiddleware from 'next-intl/middleware';
import {routing} from '@/i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel` or /fonts or /static
  matcher: '/((?!api|trpc|_next|_vercel|fonts|static|images|favicon.ico).*)'
};