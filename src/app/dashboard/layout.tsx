import DashNavbar from "@/components/dashboard/DashNavbar"; 





export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div
      >
        <DashNavbar />
        {children}
      </div>
  );
}
