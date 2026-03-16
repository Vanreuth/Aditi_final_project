import TopBar from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-1 w-full overflow-x-hidden">
        {children}
      </main>

      <Footer />
    </div>
  );
}
