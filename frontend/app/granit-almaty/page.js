import StoneLandingPage from '../components/StoneLandingPage';
import { LANDING_PAGES } from '@/lib/landingPages';

const data = LANDING_PAGES['granit-almaty'];
const path = '/granit-almaty/';

export const metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: { canonical: path },
  robots: { index: true, follow: true },
  openGraph: {
    title: data.metaTitle,
    description: data.metaDescription,
    url: path,
    siteName: 'BAS TAS',
    type: 'website',
  },
};

export default function Page() {
  return <StoneLandingPage data={data} />;
}
