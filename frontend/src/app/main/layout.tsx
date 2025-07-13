import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import ScrollToTopButton from '@/components/ScrollToTop';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            {children}
            <Footer />
            <ScrollToTopButton />
        </>
    );
}
