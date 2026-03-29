"use client";

export function Header() {
  return (
    <nav className="w-full px-8 md:px-12 h-14 flex items-center justify-between border-b border-black/5 shrink-0">
      <span className="text-sm font-black tracking-tighter uppercase">VLAKWERK</span>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="label text-[10px] text-[#c6c6c6] hover:text-[#1a1c1c] transition-colors">Configurator</a>
          <a href="#" className="label text-[10px] text-[#c6c6c6] hover:text-[#1a1c1c] transition-colors">Planning</a>
          <a href="#" className="label text-[10px] text-[#1a1c1c] border-b border-black pb-0.5">Visualizer</a>
          <a href="#" className="label text-[10px] text-[#c6c6c6] hover:text-[#1a1c1c] transition-colors">Portal</a>
        </div>
        <span className="material-symbols-outlined text-[#474747] cursor-pointer hover:text-black transition-colors">person</span>
      </div>
    </nav>
  );
}
