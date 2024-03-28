// components/Navbar.jsx
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-green-400 text-slate-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold flex items-center">
          <Image src="/images/acekingbw.jpg" alt="Logo" width={50} height={50} className="mr-2"/>
          <Link href="/">
            <span className="cursor-pointer">Blackjack</span>
          </Link>
        </div>
        <div className="flex gap-4">
          {/* Removed Login Link */}
          <Link href="/game">
            <span className="cursor-pointer hover:text-green-700 transition-colors">Game</span>
          </Link>
          <Link href="/scoreboard">
            <span className="cursor-pointer hover:text-green-700 transition-colors">Scoreboard</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
