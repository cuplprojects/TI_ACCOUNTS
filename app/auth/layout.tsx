import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#f8fafc] py-10 overflow-hidden">
      {/* Background Images */}
      <div className="absolute top-[-20px] -left-8 w-48 h-48 md:w-80 md:h-80 md:top-[-40px] md:-left-12 lg:top-[-50px] lg:-left-16 lg:w-[400px] lg:h-[400px] opacity-90 pointer-events-none transition-all duration-300">
        <Image
          src="/images/common/airplane.png"
          alt="Airplane"
          fill
          className="object-contain"
          priority
        />
      </div>

      <div className="absolute bottom-[-100px] -right-[100px] w-[300px] h-[300px] md:bottom-[-200px] md:-right-[200px] md:w-[600px] md:h-[600px] lg:bottom-[-300px] lg:-right-[300px] lg:w-[800px] lg:h-[800px] opacity-90 pointer-events-none transition-all duration-300">
        <Image
          src="/images/common/globe.png"
          alt="Globe"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-fit max-w-[700px] p-8 space-y-8 bg-white rounded-lg shadow-md">
        {children}
      </div>
    </div>
  );
}

